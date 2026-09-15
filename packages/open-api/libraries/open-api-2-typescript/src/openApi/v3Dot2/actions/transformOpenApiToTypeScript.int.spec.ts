import { beforeAll, describe, expect, it } from 'vitest';

import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import ts from 'typescript';

import { transformOpenApiToTypeScript } from './transformOpenApiToTypeScript.js';

function getTypeScriptDiagnosticMessages(source: string): string[] {
  const fileName: string = 'generated.ts';
  const compilerOptions: ts.CompilerOptions = {
    exactOptionalPropertyTypes: true,
    module: ts.ModuleKind.ESNext,
    noEmit: true,
    noLib: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  };
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );
  const compilerHost: ts.CompilerHost = {
    directoryExists: () => true,
    fileExists: (path: string) => path === fileName,
    getCanonicalFileName: (path: string) => path,
    getCurrentDirectory: () => '',
    getDefaultLibFileName: () => '',
    getDirectories: () => [],
    getNewLine: () => '\n',
    getSourceFile: (path: string) =>
      path === fileName ? sourceFile : undefined,
    readFile: (path: string) => (path === fileName ? source : undefined),
    useCaseSensitiveFileNames: () => true,
    writeFile: () => undefined,
  };
  const program: ts.Program = ts.createProgram(
    [fileName],
    compilerOptions,
    compilerHost,
  );

  return [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
  ].map((diagnostic: ts.Diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  );
}

describe(transformOpenApiToTypeScript, () => {
  describe.each<[string, OpenApi3Dot2Object, string]>([
    [
      'an OpenAPI document without components',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      },
      'export type Root = never;',
    ],
    [
      'an untitled component schema',
      {
        components: {
          schemas: {
            User: {
              type: 'string',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      },
      'export type User = string;\nexport type Root = User;',
    ],
    [
      'a titled component schema',
      {
        components: {
          schemas: {
            User: {
              title: 'Person',
              type: 'string',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      },
      'export type Person = string;\nexport type Root = Person;',
    ],
    [
      'a closed tuple component schema',
      {
        components: {
          schemas: {
            Pair: {
              items: false,
              prefixItems: [
                {
                  type: 'string',
                },
                {
                  type: 'number',
                },
              ],
              type: 'array',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      },
      'export type Pair = [] | [string] | [string, number];\nexport type Root = Pair;',
    ],
    [
      'a required closed tuple component schema',
      {
        components: {
          schemas: {
            Pair: {
              items: false,
              minItems: 2,
              prefixItems: [
                {
                  type: 'string',
                },
                {
                  type: 'number',
                },
              ],
              type: 'array',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      },
      'export type Pair = [string, number];\nexport type Root = Pair;',
    ],
    [
      'an open tuple component schema',
      {
        components: {
          schemas: {
            Coordinates: {
              prefixItems: [
                {
                  type: 'number',
                },
                {
                  type: 'number',
                },
              ],
              type: 'array',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      },
      'export type Coordinates = [] | [number] | [number, number, ...unknown[]];\nexport type Root = Coordinates;',
    ],
    [
      'a tuple component schema with rest items',
      {
        components: {
          schemas: {
            Row: {
              items: {
                type: 'boolean',
              },
              prefixItems: [
                {
                  type: 'string',
                },
                {
                  type: 'number',
                },
              ],
              type: 'array',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      },
      'export type Row = [] | [string] | [string, number, ...boolean[]];\nexport type Root = Row;',
    ],
  ])(
    'having %s',
    (_: string, openApiObjectFixture: OpenApi3Dot2Object, expected: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = transformOpenApiToTypeScript(openApiObjectFixture);
        });

        it('should return the expected TypeScript module', () => {
          expect(result).toBe(expected);
        });

        it('should return a TypeScript module that compiles', () => {
          expect(
            getTypeScriptDiagnosticMessages(result as string),
          ).toStrictEqual([]);
        });
      });
    },
  );

  describe('having component schemas that $ref each other', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Address: {
              properties: {
                city: {
                  type: 'string',
                },
              },
              required: ['city'],
              type: 'object',
            },
            User: {
              properties: {
                address: {
                  $ref: '#/components/schemas/Address',
                },
                id: {
                  type: 'string',
                },
              },
              required: ['address', 'id'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should return named aliases and a Root union', () => {
        expect(result).toBe(
          'export type Address = { city: string };\nexport type User = { address: Address; id: string };\nexport type Root = Address | User;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a component schema referenced as array items', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            PaginatedTodosV1Response: {
              properties: {
                items: {
                  items: {
                    $ref: '#/components/schemas/TodoV1',
                  },
                  type: 'array',
                },
              },
              required: ['items'],
              type: 'object',
            },
            TodoV1: {
              properties: {
                id: {
                  type: 'string',
                },
                title: {
                  type: 'string',
                },
              },
              required: ['id', 'title'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should reuse TodoV1 for the array items', () => {
        expect(result).toBe(
          'export type PaginatedTodosV1Response = { items: TodoV1[] };\nexport type TodoV1 = { id: string; title: string };\nexport type Root = PaginatedTodosV1Response | TodoV1;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a component schema referenced as a prefixItem', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            TodoEntry: {
              items: false,
              prefixItems: [
                {
                  $ref: '#/components/schemas/TodoV1',
                },
                {
                  type: 'string',
                },
              ],
              type: 'array',
            },
            TodoV1: {
              properties: {
                id: {
                  type: 'string',
                },
                title: {
                  type: 'string',
                },
              },
              required: ['id', 'title'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should reuse TodoV1 for the tuple prefix item', () => {
        expect(result).toBe(
          'export type TodoEntry = [] | [TodoV1] | [TodoV1, string];\nexport type TodoV1 = { id: string; title: string };\nexport type Root = TodoEntry | TodoV1;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a component schema with nested object and array properties referenced as array items', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            PaginatedTodosV1Response: {
              properties: {
                items: {
                  items: {
                    $ref: '#/components/schemas/TodoV1',
                  },
                  type: 'array',
                },
              },
              required: ['items'],
              type: 'object',
            },
            TodoV1: {
              properties: {
                address: {
                  properties: {
                    city: {
                      type: 'string',
                    },
                  },
                  required: ['city'],
                  type: 'object',
                },
                tags: {
                  items: {
                    type: 'string',
                  },
                  type: 'array',
                },
                title: {
                  type: 'string',
                },
              },
              required: ['address', 'tags', 'title'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should reuse TodoV1 including its nested object and array properties', () => {
        expect(result).toBe(
          'export type PaginatedTodosV1Response = { items: TodoV1[] };\nexport type TodoV1 = { address: { city: string }; tags: string[]; title: string };\nexport type Root = PaginatedTodosV1Response | TodoV1;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a $self identifier and a relative schema $id', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        $self: 'https://example.com/openapi.json',
        components: {
          schemas: {
            User: {
              $id: 'user.json',
              type: 'string',
            },
            Wrapper: {
              $ref: 'user.json',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should resolve the relative $id against $self', () => {
        expect(result).toBe(
          'export type User = string;\nexport type Wrapper = string;\nexport type Root = User | Wrapper;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having three string enum component schemas', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Color: {
              enum: ['red', 'green'],
              type: 'string',
            },
            Size: {
              enum: ['s', 'm'],
              type: 'string',
            },
            Status: {
              enum: ['on', 'off'],
              type: 'string',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should absorb each string enum without Type1, Type2, or Type3 aliases', () => {
        expect(result).toBe(
          'export type Color = "red" | "green";\nexport type Size = "s" | "m";\nexport type Status = "on" | "off";\nexport type Root = Color | Size | Status;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a component schema with a string const property', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            ReviewGroupDimensionV1: {
              properties: {
                kind: {
                  const: 'discreteNumericRange',
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
              },
              required: ['kind', 'name'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should emit the const literal without intersecting string', () => {
        expect(result).toBe(
          'export type ReviewGroupDimensionV1 = { kind: "discreteNumericRange"; name: string };\nexport type Root = ReviewGroupDimensionV1;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a component schema with a nested object const', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            DefaultReviewPolicyV1: {
              additionalProperties: false,
              const: {
                limits: {
                  maxAttachments: 3,
                  maxDescriptionSize: 2000,
                },
                mode: 'moderated',
              },
              properties: {
                limits: {
                  additionalProperties: false,
                  properties: {
                    maxAttachments: {
                      type: 'integer',
                    },
                    maxDescriptionSize: {
                      type: 'integer',
                    },
                  },
                  required: ['maxAttachments', 'maxDescriptionSize'],
                  type: 'object',
                },
                mode: {
                  enum: ['moderated', 'open'],
                  type: 'string',
                },
              },
              required: ['limits', 'mode'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should emit the object const without intersecting object constraints', () => {
        expect(result).toBe(
          'export type DefaultReviewPolicyV1 = { limits: { maxAttachments: 3; maxDescriptionSize: 2000 }; mode: "moderated" };\nexport type Root = DefaultReviewPolicyV1;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe('having a component schema with two properties that $ref the same string enum and a matching const', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            Color: {
              enum: ['red', 'green'],
              type: 'string',
            },
            FlagPair: {
              const: {
                primary: 'red',
                secondary: 'red',
              },
              properties: {
                primary: {
                  $ref: '#/components/schemas/Color',
                },
                secondary: {
                  $ref: '#/components/schemas/Color',
                },
              },
              required: ['primary', 'secondary'],
              type: 'object',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = transformOpenApiToTypeScript(openApiObjectFixture);
      });

      it('should absorb the object const against the shared enum component', () => {
        expect(result).toBe(
          'export type Color = "red" | "green";\nexport type FlagPair = { primary: "red"; secondary: "red" };\nexport type Root = Color | FlagPair;',
        );
      });

      it('should return a TypeScript module that compiles', () => {
        expect(getTypeScriptDiagnosticMessages(result as string)).toStrictEqual(
          [],
        );
      });
    });
  });

  describe.each<[string, OpenApi3Dot2Object, string]>([
    [
      'an operation without parameters',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
            },
          },
        },
      },
      'export type Root = never;',
    ],
    [
      'an operation with query parameters and an operationId',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
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
      },
      'export type ListTodosQuery = { page?: number; pageSize: number };\nexport type Root = ListTodosQuery;',
    ],
    [
      'an operation without an operationId',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
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
      },
      'export type GetV1TodosIdPathParams = { id: string };\nexport type Root = GetV1TodosIdPathParams;',
    ],
    [
      'header and cookie parameters',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  in: 'header',
                  name: 'X-Request-Id',
                  required: true,
                  schema: {
                    type: 'string',
                  },
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
      },
      'export type ListTodosHeaders = { "X-Request-Id": string };\nexport type ListTodosCookies = { session?: string };\nexport type Root = ListTodosHeaders | ListTodosCookies;',
    ],
    [
      'a querystring parameter with an inline schema',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/search': {
            get: {
              operationId: 'searchItems',
              parameters: [
                {
                  in: 'querystring',
                  name: 'q',
                  schema: {
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
              ],
            },
          },
        },
      },
      'export type SearchItemsQuerystring = { filter?: string; sort?: string };\nexport type Root = SearchItemsQuerystring;',
    ],
    [
      'a querystring parameter whose schema is a $ref',
      {
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
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
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
      },
      'export type SearchQuery = { filter?: string; sort?: string };\nexport type SearchItemsQuerystring = { filter?: string; sort?: string };\nexport type Root = SearchQuery | SearchItemsQuerystring;',
    ],
    [
      'a querystring parameter whose schema has an $id',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
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
      },
      'export type SearchItemsQuerystring = { filter?: string };\nexport type Root = SearchItemsQuerystring;',
    ],
    [
      'a QUERY operation',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/todos': {
            query: {
              operationId: 'queryTodos',
              parameters: [
                {
                  in: 'query',
                  name: 'q',
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
      },
      'export type QueryTodosQuery = { q?: string };\nexport type Root = QueryTodosQuery;',
    ],
    [
      'an additional operation with a content parameter schema',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
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
      },
      'export type PurgeTodosQuery = { filter?: { q?: string } };\nexport type Root = PurgeTodosQuery;',
    ],
    [
      'a component schema and a query parameter that $ref it',
      {
        components: {
          schemas: {
            PageSize: {
              type: 'integer',
            },
          },
        },
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  in: 'query',
                  name: 'pageSize',
                  schema: {
                    $ref: '#/components/schemas/PageSize',
                  },
                },
              ],
            },
          },
        },
      },
      'export type PageSize = number;\nexport type ListTodosQuery = { pageSize?: PageSize };\nexport type Root = PageSize | ListTodosQuery;',
    ],
    [
      'a referenced parameter object',
      {
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
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  $ref: '#/components/parameters/Page',
                },
              ],
            },
          },
        },
      },
      'export type ListTodosQuery = { page?: number };\nexport type Root = ListTodosQuery;',
    ],
    [
      'a parameter $ref using $self',
      {
        $self: 'https://example.com/openapi.json',
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
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/todos': {
            get: {
              operationId: 'listTodos',
              parameters: [
                {
                  $ref: 'https://example.com/openapi.json#/components/parameters/Page',
                },
              ],
            },
          },
        },
      },
      'export type ListTodosQuery = { page?: number };\nexport type Root = ListTodosQuery;',
    ],
    [
      'path-item parameters overridden by operation parameters',
      {
        info: { title: 'API', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/todos/{id}': {
            get: {
              operationId: 'getTodo',
              parameters: [
                {
                  in: 'query',
                  name: 'pretty',
                  schema: {
                    type: 'boolean',
                  },
                },
              ],
            },
            parameters: [
              {
                in: 'path',
                name: 'id',
                schema: {
                  type: 'string',
                },
              },
              {
                in: 'query',
                name: 'pretty',
                schema: {
                  type: 'string',
                },
              },
            ],
          },
        },
      },
      'export type GetTodoPathParams = { id: string };\nexport type GetTodoQuery = { pretty?: boolean };\nexport type Root = GetTodoPathParams | GetTodoQuery;',
    ],
  ])(
    'having %s',
    (_: string, openApiObjectFixture: OpenApi3Dot2Object, expected: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = transformOpenApiToTypeScript(openApiObjectFixture);
        });

        it('should return the expected TypeScript module', () => {
          expect(result).toBe(expected);
        });

        it('should return a TypeScript module that compiles', () => {
          expect(
            getTypeScriptDiagnosticMessages(result as string),
          ).toStrictEqual([]);
        });
      });
    },
  );
});
