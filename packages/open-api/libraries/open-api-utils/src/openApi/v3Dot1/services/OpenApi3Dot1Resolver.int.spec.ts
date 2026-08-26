import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import {
  type OpenApi3Dot1RefResolutionResult,
  OpenApi3Dot1Resolver,
} from './OpenApi3Dot1Resolver.js';

const INVALID_REFERENCE_OBJECT_REASON: string =
  'Invalid OpenAPI Reference Object: expected an object with a string "$ref" property and optional "summary" and "description" properties';

const OPEN_API_DOCUMENT_URI_FIXTURE: string =
  'https://example.com/openapi.json';

describe(OpenApi3Dot1Resolver, () => {
  describe('constructor', () => {
    describe('having a relative OpenAPI document URI', () => {
      let openApiDocumentUriFixture: string;

      beforeAll(() => {
        openApiDocumentUriFixture = 'openapi.json';
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            new OpenApi3Dot1Resolver(
              openApiDocumentUriFixture,
              () => undefined,
            );
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toBeInstanceOf(Error);
          expect((result as Error).cause).toBeInstanceOf(Error);
          expect((result as Error).message).toBe(
            `Invalid OpenAPI document URI: ${openApiDocumentUriFixture}`,
          );
        });
      });
    });
  });

  describe('.resolveRef', () => {
    describe('having a same-document ref and an OpenAPI document URI with a fragment', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        requestBodyFixture = {
          content: {},
        };
        documentFixture = {
          components: {
            requestBodies: {
              Pet: requestBodyFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          `${documentIdFixture}#/unused`,
          resolveIdMock,
        );

        refFixture = {
          $ref: '#/components/requestBodies/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should load the document without the fragment', () => {
          expect(resolveIdMock).toHaveBeenCalledTimes(1);
          expect(resolveIdMock).toHaveBeenCalledWith(documentIdFixture);
        });

        it('should return the referenced request body', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/requestBodies/Pet',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/Pet`,
                  value: refFixture,
                },
              ],
              value: requestBodyFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a null ref value', () => {
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = null;

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: INVALID_REFERENCE_OBJECT_REASON,
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a primitive ref value', () => {
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = 'https://example.com/requestBody.json';

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: INVALID_REFERENCE_OBJECT_REASON,
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref object without a $ref property', () => {
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          description: 'A reference-like object',
        };

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: INVALID_REFERENCE_OBJECT_REASON,
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref object with a non-string $ref property', () => {
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          $ref: 42,
        };

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: INVALID_REFERENCE_OBJECT_REASON,
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref object with additional properties', () => {
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          $ref: 'https://example.com/requestBody.json',
          type: 'object',
        };

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: INVALID_REFERENCE_OBJECT_REASON,
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having an array ref value', () => {
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = [
          {
            $ref: 'https://example.com/requestBody.json',
          },
        ];

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: INVALID_REFERENCE_OBJECT_REASON,
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to an entire document', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/requestBody.json';
        documentFixture = {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Pet',
              },
            },
          },
          required: true,
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          resolveIdMock,
        );

        refFixture = {
          $ref: documentIdFixture,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the referenced document', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: documentIdFixture,
                  canonicalId: documentIdFixture,
                  value: refFixture,
                },
              ],
              value: documentFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });

        it('should not resolve JSON Schema $refs within the target', () => {
          expect(resolveIdMock).toHaveBeenCalledTimes(1);
          expect(resolveIdMock).toHaveBeenCalledWith(documentIdFixture);
        });
      });
    });

    describe('having a ref with a JSON pointer fragment', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        requestBodyFixture = {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Pet',
              },
            },
          },
          required: true,
        };
        documentFixture = {
          components: {
            requestBodies: {
              Pet: requestBodyFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the referenced request body', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/requestBodies/Pet',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/Pet`,
                  value: refFixture,
                },
              ],
              value: requestBodyFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref with an escaped JSON pointer fragment', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        requestBodyFixture = {
          content: {},
        };
        documentFixture = {
          components: {
            'a/b': requestBodyFixture,
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/components/a~1b`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the request body at the escaped pointer', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: `${documentIdFixture}#/components/a~1b`,
                  canonicalId: `${documentIdFixture}#/components/a~1b`,
                  value: refFixture,
                },
              ],
              value: requestBodyFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref with a percent-encoded JSON pointer fragment', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        requestBodyFixture = {
          content: {},
        };
        documentFixture = {
          components: {
            'Pet Name': requestBodyFixture,
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/components/${encodeURIComponent('Pet Name')}`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the request body at the decoded pointer', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: `${documentIdFixture}#/components/Pet%20Name`,
                  canonicalId: `${documentIdFixture}#/components/Pet%20Name`,
                  value: refFixture,
                },
              ],
              value: requestBodyFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref with a malformed percent-encoded fragment', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          components: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#%GG`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: 'Invalid URI fragment: %GG',
              resolutionContextStack: [
                {
                  $ref: `${documentIdFixture}#%GG`,
                  canonicalId: `${documentIdFixture}#%GG`,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref with a JSON pointer to an array element', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        requestBodyFixture = {
          content: {},
        };
        documentFixture = {
          list: [requestBodyFixture],
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/list/0`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the request body at the array index', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: `${documentIdFixture}#/list/0`,
                  canonicalId: `${documentIdFixture}#/list/0`,
                  value: refFixture,
                },
              ],
              value: requestBodyFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a relative ref', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let openApiDocumentUriFixture: string;
      let refFixture: JsonValue;

      beforeAll(() => {
        openApiDocumentUriFixture = 'https://example.com/api/openapi.json';
        documentIdFixture = 'https://example.com/api/requestBody.json';
        documentFixture = {
          content: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          openApiDocumentUriFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: 'requestBody.json',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should resolve the ref against the OpenAPI document URI', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: 'requestBody.json',
                  canonicalId: documentIdFixture,
                  value: refFixture,
                },
              ],
              value: documentFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a relative ref to a missing resource', () => {
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          $ref: 'requestBody.json',
        };

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason:
                'Failed to resolve resource identified by: https://example.com/requestBody.json',
              resolutionContextStack: [
                {
                  $ref: 'requestBody.json',
                  canonicalId: 'https://example.com/requestBody.json',
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to a ref to a request body', () => {
      let aliasRefFixture: JsonValue;
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        requestBodyFixture = {
          content: {},
          required: true,
        };
        aliasRefFixture = {
          $ref: '#/components/requestBodies/Pet',
        };
        documentFixture = {
          components: {
            requestBodies: {
              Alias: aliasRefFixture,
              Pet: requestBodyFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Alias',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the final request body', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/requestBodies/Alias',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/Alias`,
                  value: refFixture,
                },
                {
                  $ref: '#/components/requestBodies/Pet',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/Pet`,
                  value: aliasRefFixture,
                },
              ],
              value: requestBodyFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to a schema object with a JSON Schema $ref and sibling keywords', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let petSchemaFixture: JsonValue;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        petSchemaFixture = {
          $ref: '#/components/schemas/Animal',
          description: 'A pet',
          type: 'object',
        };
        documentFixture = {
          components: {
            schemas: {
              Animal: {
                type: 'object',
              },
              Pet: petSchemaFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/schemas/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the schema object without following its $ref', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/schemas/Pet',
                  canonicalId: `${documentIdFixture}#/components/schemas/Pet`,
                  value: refFixture,
                },
              ],
              value: petSchemaFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to a $ref-only schema object', () => {
      let animalSchemaFixture: JsonValue;
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let petSchemaFixture: JsonValue;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        animalSchemaFixture = {
          type: 'object',
        };
        petSchemaFixture = {
          $ref: '#/components/schemas/Animal',
        };
        documentFixture = {
          components: {
            schemas: {
              Animal: animalSchemaFixture,
              Pet: petSchemaFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/schemas/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should follow the $ref as an OpenAPI Reference Object', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/schemas/Pet',
                  canonicalId: `${documentIdFixture}#/components/schemas/Pet`,
                  value: refFixture,
                },
                {
                  $ref: '#/components/schemas/Animal',
                  canonicalId: `${documentIdFixture}#/components/schemas/Animal`,
                  value: petSchemaFixture,
                },
              ],
              value: animalSchemaFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to a media type schema with a JSON Schema $ref and sibling keywords', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let schemaFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        schemaFixture = {
          $ref: '#/components/schemas/Pet',
          type: 'object',
        };
        documentFixture = {
          paths: {
            '/pets': {
              get: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: schemaFixture,
                    },
                  },
                },
              },
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/paths/~1pets/get/requestBody/content/application~1json/schema',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the schema object without following its $ref', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/paths/~1pets/get/requestBody/content/application~1json/schema',
                  canonicalId: `${documentIdFixture}#/paths/~1pets/get/requestBody/content/application~1json/schema`,
                  value: refFixture,
                },
              ],
              value: schemaFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to a path item object with a $ref field', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let pathItemFixture: JsonValue;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        pathItemFixture = {
          $ref: '#/components/pathItems/Pet',
          get: {
            responses: {},
          },
        };
        documentFixture = {
          components: {
            pathItems: {
              Pet: {
                get: {
                  operationId: 'getPet',
                },
              },
            },
          },
          paths: {
            '/pets': pathItemFixture,
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/paths/~1pets',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the path item object without following its $ref', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/paths/~1pets',
                  canonicalId: `${documentIdFixture}#/paths/~1pets`,
                  value: refFixture,
                },
              ],
              value: pathItemFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to a webhook that is a path item reference', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let pathItemFixture: JsonValue;
      let refFixture: JsonValue;
      let webhookRefFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        pathItemFixture = {
          get: {
            responses: {},
          },
        };
        webhookRefFixture = {
          $ref: '#/paths/~1pets',
        };
        documentFixture = {
          paths: {
            '/pets': pathItemFixture,
          },
          webhooks: {
            newPet: webhookRefFixture,
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/webhooks/newPet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should follow the webhook reference object', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/webhooks/newPet',
                  canonicalId: `${documentIdFixture}#/webhooks/newPet`,
                  value: refFixture,
                },
                {
                  $ref: '#/paths/~1pets',
                  canonicalId: `${documentIdFixture}#/paths/~1pets`,
                  value: webhookRefFixture,
                },
              ],
              value: pathItemFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref chain across documents', () => {
      let aliasRefFixture: JsonValue;
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;
      let sharedDocumentFixture: JsonValue;
      let sharedDocumentIdFixture: string;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        sharedDocumentIdFixture = 'https://example.com/shared.json';
        requestBodyFixture = {
          content: {},
          required: true,
        };
        aliasRefFixture = {
          $ref: 'shared.json#/components/requestBodies/Pet',
        };
        documentFixture = {
          components: {
            requestBodies: {
              Alias: aliasRefFixture,
            },
          },
        };
        sharedDocumentFixture = {
          components: {
            requestBodies: {
              Pet: requestBodyFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
          [sharedDocumentIdFixture, sharedDocumentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Alias',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should resolve the second hop against the referring document', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/requestBodies/Alias',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/Alias`,
                  value: refFixture,
                },
                {
                  $ref: 'shared.json#/components/requestBodies/Pet',
                  canonicalId: `${sharedDocumentIdFixture}#/components/requestBodies/Pet`,
                  value: aliasRefFixture,
                },
              ],
              value: requestBodyFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a circular ref chain', () => {
      let aRefFixture: JsonValue;
      let bRefFixture: JsonValue;
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        aRefFixture = {
          $ref: '#/components/requestBodies/B',
        };
        bRefFixture = {
          $ref: '#/components/requestBodies/A',
        };
        documentFixture = {
          components: {
            requestBodies: {
              A: aRefFixture,
              B: bRefFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/A',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure with the followed chain', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: `Circular reference detected: ${documentIdFixture}#/components/requestBodies/A`,
              resolutionContextStack: [
                {
                  $ref: '#/components/requestBodies/A',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/A`,
                },
                {
                  $ref: '#/components/requestBodies/B',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/B`,
                },
                {
                  $ref: '#/components/requestBodies/A',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/A`,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a self-referencing ref', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          components: {
            requestBodies: {
              A: {
                $ref: '#/components/requestBodies/A',
              },
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/A',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a circular reference failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: `Circular reference detected: ${documentIdFixture}#/components/requestBodies/A`,
              resolutionContextStack: [
                {
                  $ref: '#/components/requestBodies/A',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/A`,
                },
                {
                  $ref: '#/components/requestBodies/A',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/A`,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to a missing resource', () => {
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          $ref: 'https://example.com/missing.json',
        };

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason:
                'Failed to resolve resource identified by: https://example.com/missing.json',
              resolutionContextStack: [
                {
                  $ref: 'https://example.com/missing.json',
                  canonicalId: 'https://example.com/missing.json',
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref to a ref to a missing resource', () => {
      let aliasRefFixture: JsonValue;
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        aliasRefFixture = {
          $ref: 'https://example.com/missing.json',
        };
        documentFixture = {
          components: {
            requestBodies: {
              Alias: aliasRefFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Alias',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure including the missing hop', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason:
                'Failed to resolve resource identified by: https://example.com/missing.json',
              resolutionContextStack: [
                {
                  $ref: '#/components/requestBodies/Alias',
                  canonicalId: `${documentIdFixture}#/components/requestBodies/Alias`,
                },
                {
                  $ref: 'https://example.com/missing.json',
                  canonicalId: 'https://example.com/missing.json',
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref with a non-pointer fragment', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          pet: 'Rex',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#Pet`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason:
                'Invalid fragment: Pet (OpenAPI reference fragments MUST be JSON Pointers)',
              resolutionContextStack: [
                {
                  $ref: `${documentIdFixture}#Pet`,
                  canonicalId: `${documentIdFixture}#Pet`,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref with a pointer to a missing key', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          components: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/components/requestBodies/Pet`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason:
                'Failed to resolve JSON Pointer: /components/requestBodies/Pet',
              resolutionContextStack: [
                {
                  $ref: `${documentIdFixture}#/components/requestBodies/Pet`,
                  canonicalId: `${documentIdFixture}#/components/requestBodies/Pet`,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref with a pointer traversing a non-object', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          pet: 'Rex',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/pet/child`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: false,
            value: {
              reason: 'Failed to resolve JSON Pointer: /pet/child',
              resolutionContextStack: [
                {
                  $ref: `${documentIdFixture}#/pet/child`,
                  canonicalId: `${documentIdFixture}#/pet/child`,
                },
              ],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref whose target is a primitive', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          pet: 'Rex',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/pet`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return the primitive target', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: `${documentIdFixture}#/pet`,
                  canonicalId: `${documentIdFixture}#/pet`,
                  value: refFixture,
                },
              ],
              value: 'Rex',
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref whose target is null', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          empty: null,
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/empty`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should return a null target', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: `${documentIdFixture}#/empty`,
                  canonicalId: `${documentIdFixture}#/empty`,
                  value: refFixture,
                },
              ],
              value: null,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a ref with summary and description properties', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/requestBody.json';
        documentFixture = {
          content: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: documentIdFixture,
          description: 'A reference description',
          summary: 'A reference summary',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot1RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should ignore the summary and description properties', () => {
          const expected: OpenApi3Dot1RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: documentIdFixture,
                  canonicalId: documentIdFixture,
                  value: refFixture,
                },
              ],
              value: documentFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having the same document referenced multiple times', () => {
      let documentFixture: JsonValue;
      let documentIdFixture: string;
      let openApi3Dot1Resolver: OpenApi3Dot1Resolver;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/requestBody.json';
        documentFixture = {
          content: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot1Resolver = new OpenApi3Dot1Resolver(
          documentIdFixture,
          resolveIdMock,
        );

        refFixture = {
          $ref: documentIdFixture,
        };
      });

      describe('when called twice', () => {
        beforeAll(() => {
          openApi3Dot1Resolver.resolveRef(refFixture);
          openApi3Dot1Resolver.resolveRef(refFixture);
        });

        it('should load the document only once', () => {
          expect(resolveIdMock).toHaveBeenCalledTimes(1);
          expect(resolveIdMock).toHaveBeenCalledWith(documentIdFixture);
        });
      });
    });
  });
});
