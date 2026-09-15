import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonSchema,
  type JsonSchemaObject,
} from '@inversifyjs/json-schema-types/2020-12';

import { collectOperationParameterSchemas } from './collectOperationParameterSchemas.js';

const DOCUMENT_BASE_URI: string = 'urn:test:openapi';

function collectOperationParameterSchemasFromDocument(
  document: JsonValue,
): JsonSchema[] {
  return collectOperationParameterSchemas(document, {
    documentBaseUri: DOCUMENT_BASE_URI,
    resolveId: (id: string): JsonValue | undefined =>
      id === DOCUMENT_BASE_URI ? document : undefined,
  });
}

describe(collectOperationParameterSchemas, () => {
  describe.each<[string, JsonValue]>([
    ['null', null],
    ['a boolean', true],
    ['an array', []],
    ['an object without paths or webhooks', { info: { title: 'API' } }],
    ['an object with a non-object paths value', { paths: '/todos' }],
  ])('having %s', (_: string, documentFixture: JsonValue) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should return an empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having an operation with query parameters and an operationId', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/v1/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  in: 'query',
                  name: 'page',
                  schema: {
                    type: 'integer',
                  },
                },
                {
                  in: 'query',
                  name: 'pageSize',
                  required: true,
                  schema: {
                    type: 'integer',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should return a titled query object schema', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              page: {
                type: 'integer',
              },
              pageSize: {
                type: 'integer',
              },
            },
            required: ['pageSize'],
            title: 'ListTodosQuery',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having an operation without an operationId', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/v1/todos/{id}': {
            get: {
              parameters: [
                {
                  in: 'path',
                  name: 'id',
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should title the path params schema from the method and path', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              id: {
                type: 'string',
              },
            },
            required: ['id'],
            title: 'GetV1TodosIdPathParams',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having path-item and operation parameters with the same name and location', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  in: 'query',
                  name: 'limit',
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
            parameters: [
              {
                in: 'query',
                name: 'limit',
                schema: {
                  type: 'integer',
                },
              },
              {
                in: 'header',
                name: 'X-Request-Id',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should override the path-item parameter and keep the header schema', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              limit: {
                type: 'string',
              },
            },
            title: 'ListTodosQuery',
            type: 'object',
          },
          {
            properties: {
              'X-Request-Id': {
                type: 'string',
              },
            },
            required: ['X-Request-Id'],
            title: 'ListTodosHeaders',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe.each([
    'Accept',
    'Content-Type',
    'Authorization',
    'accept',
    'AUTHORIZATION',
    'content-type',
  ])('having a header parameter named %s', (headerNameFixture: string) => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  in: 'header',
                  name: headerNameFixture,
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should omit the header parameter', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having ignored header parameters and a custom header', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  in: 'header',
                  name: 'authorization',
                  schema: {
                    type: 'string',
                  },
                },
                {
                  in: 'header',
                  name: 'Accept',
                  schema: {
                    type: 'string',
                  },
                },
                {
                  in: 'header',
                  name: 'Content-Type',
                  schema: {
                    type: 'string',
                  },
                },
                {
                  in: 'header',
                  name: 'X-Request-Id',
                  required: true,
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should keep the custom header', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              'X-Request-Id': {
                type: 'string',
              },
            },
            required: ['X-Request-Id'],
            title: 'ListTodosHeaders',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having a query parameter named Authorization', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  in: 'query',
                  name: 'Authorization',
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should keep the query parameter', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              Authorization: {
                type: 'string',
              },
            },
            title: 'ListTodosQuery',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having a referenced parameter and cookie parameter', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        components: {
          parameters: {
            Page: {
              in: 'query',
              name: 'page',
              schema: {
                type: 'integer',
              },
            },
          },
        },
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  $ref: '#/components/parameters/Page',
                },
                {
                  in: 'cookie',
                  name: 'session',
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should resolve the referenced parameter and title the cookie schema', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              page: {
                type: 'integer',
              },
            },
            title: 'ListTodosQuery',
            type: 'object',
          },
          {
            properties: {
              session: {
                type: 'string',
              },
            },
            title: 'ListTodosCookies',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having a parameter $ref with the document URI', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        components: {
          parameters: {
            Page: {
              in: 'query',
              name: 'page',
              schema: {
                type: 'integer',
              },
            },
          },
        },
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  $ref: `${DOCUMENT_BASE_URI}#/components/parameters/Page`,
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should resolve the parameter against the document URI', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              page: {
                type: 'integer',
              },
            },
            title: 'ListTodosQuery',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having multiple querystring parameters', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/search': {
            get: {
              operationId: 'searchItems',
              parameters: [
                {
                  in: 'querystring',
                  name: 'q',
                  schema: {
                    type: 'string',
                  },
                },
                {
                  in: 'querystring',
                  name: 'extra',
                  schema: {
                    type: 'boolean',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should emit an object keyed by parameter name', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              extra: {
                type: 'boolean',
              },
              q: {
                type: 'string',
              },
            },
            title: 'SearchItemsQuerystring',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having a querystring parameter with an inline schema', () => {
    let documentFixture: JsonValue;
    let querystringSchemaFixture: JsonSchemaObject;

    beforeAll(() => {
      querystringSchemaFixture = {
        properties: {
          filter: {
            type: 'string',
          },
          sort: {
            type: 'string',
          },
        },
        type: 'object',
      };
      documentFixture = {
        paths: {
          '/search': {
            get: {
              operationId: 'searchItems',
              parameters: [
                {
                  in: 'querystring',
                  name: 'q',
                  schema: querystringSchemaFixture,
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should title the querystring schema with an allOf wrapper without wrapping the parameter name', () => {
        expect(result).toStrictEqual([
          {
            allOf: [querystringSchemaFixture],
            title: 'SearchItemsQuerystring',
          },
        ]);
      });

      it('should reuse the original schema object in allOf', () => {
        expect((result as JsonSchemaObject[])[0]?.allOf?.[0]).toBe(
          querystringSchemaFixture,
        );
      });
    });
  });

  describe('having a querystring parameter whose schema is a $ref', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        components: {
          schemas: {
            SearchQuery: {
              properties: {
                filter: {
                  type: 'string',
                },
                sort: {
                  type: 'string',
                },
              },
              type: 'object',
            },
          },
        },
        paths: {
          '/search': {
            get: {
              operationId: 'searchItems',
              parameters: [
                {
                  in: 'querystring',
                  name: 'q',
                  schema: {
                    $ref: '#/components/schemas/SearchQuery',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should title the querystring schema with a $ref wrapper', () => {
        expect(result).toStrictEqual([
          {
            $ref: '#/components/schemas/SearchQuery',
            title: 'SearchItemsQuerystring',
          },
        ]);
      });
    });
  });

  describe('having a querystring parameter whose schema has an $id', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/search': {
            get: {
              operationId: 'searchItems',
              parameters: [
                {
                  in: 'querystring',
                  name: 'q',
                  schema: {
                    $id: 'https://example.com/schemas/search-query.json',
                    properties: {
                      filter: {
                        type: 'string',
                      },
                    },
                    type: 'object',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should title the querystring schema with a $ref to the $id', () => {
        expect(result).toStrictEqual([
          {
            $ref: 'https://example.com/schemas/search-query.json',
            title: 'SearchItemsQuerystring',
          },
        ]);
      });
    });
  });

  describe('having a referenced path item', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        components: {
          pathItems: {
            TodoItem: {
              get: {
                operationId: 'getTodo',
                parameters: [
                  {
                    in: 'path',
                    name: 'id',
                    schema: {
                      type: 'string',
                    },
                  },
                ],
              },
            },
          },
        },
        paths: {
          '/todos/{id}': {
            $ref: '#/components/pathItems/TodoItem',
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should collect parameters from the referenced path item', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              id: {
                type: 'string',
              },
            },
            required: ['id'],
            title: 'GetTodoPathParams',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having a webhook operation', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        webhooks: {
          'new-todo': {
            post: {
              parameters: [
                {
                  in: 'header',
                  name: 'X-Webhook-Secret',
                  required: true,
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should title the header schema from the method and webhook name', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              'X-Webhook-Secret': {
                type: 'string',
              },
            },
            required: ['X-Webhook-Secret'],
            title: 'PostNewTodoHeaders',
            type: 'object',
          },
        ]);
      });
    });
  });

  describe('having an unresolvable parameter $ref', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  $ref: '#/components/parameters/Missing',
                },
              ],
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should skip the parameter', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having additionalOperations and a content parameter schema', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        paths: {
          '/todos': {
            additionalOperations: {
              purge: {
                operationId: 'purgeTodos',
                parameters: [
                  {
                    content: {
                      'application/json': {
                        schema: {
                          properties: {
                            q: {
                              type: 'string',
                            },
                          },
                          type: 'object',
                        },
                      },
                    },
                    in: 'query',
                    name: 'filter',
                  },
                ],
              },
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = collectOperationParameterSchemasFromDocument(documentFixture);
      });

      it('should collect the additional operation query schema from content', () => {
        expect(result).toStrictEqual([
          {
            properties: {
              filter: {
                properties: {
                  q: {
                    type: 'string',
                  },
                },
                type: 'object',
              },
            },
            title: 'PurgeTodosQuery',
            type: 'object',
          },
        ]);
      });
    });
  });
});
