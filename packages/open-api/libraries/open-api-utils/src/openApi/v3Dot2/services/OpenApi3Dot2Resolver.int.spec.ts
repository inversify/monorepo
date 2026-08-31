import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import {
  type OpenApi3Dot2RefResolutionResult,
  OpenApi3Dot2Resolver,
} from './OpenApi3Dot2Resolver.js';

const INVALID_REFERENCE_OBJECT_REASON: string =
  'Invalid OpenAPI Reference Object: expected an object with a string "$ref" property and optional "summary" and "description" properties';

const OPEN_API_DOCUMENT_URI_FIXTURE: string =
  'https://example.com/openapi.json';

describe(OpenApi3Dot2Resolver, () => {
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
            new OpenApi3Dot2Resolver(
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          `${documentIdFixture}#/unused`,
          resolveIdMock,
        );

        refFixture = {
          $ref: '#/components/requestBodies/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should load the document without the fragment', () => {
          expect(resolveIdMock).toHaveBeenCalledTimes(1);
          expect(resolveIdMock).toHaveBeenCalledWith(documentIdFixture);
        });

        it('should return the referenced request body', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = null;

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = 'https://example.com/requestBody.json';

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          description: 'A reference-like object',
        };

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          $ref: 42,
        };

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          $ref: 'https://example.com/requestBody.json',
          type: 'object',
        };

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = [
          {
            $ref: 'https://example.com/requestBody.json',
          },
        ];

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          resolveIdMock,
        );

        refFixture = {
          $ref: documentIdFixture,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the referenced document', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the referenced request body', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/components/a~1b`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the request body at the escaped pointer', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/components/${encodeURIComponent('Pet Name')}`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the request body at the decoded pointer', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          components: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#%GG`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/list/0`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the request body at the array index', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          openApiDocumentUriFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: 'requestBody.json',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should resolve the ref against the OpenAPI document URI', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          $ref: 'requestBody.json',
        };

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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

    describe('having a same-document ref and a document with $self', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;
      let retrievalUriFixture: string;
      let selfUriFixture: string;

      beforeAll(() => {
        retrievalUriFixture = 'https://git.example.com/blob/main/openapi.yaml';
        selfUriFixture = 'https://example.com/api/openapi';
        requestBodyFixture = {
          content: {},
        };
        documentFixture = {
          $self: selfUriFixture,
          components: {
            requestBodies: {
              Pet: requestBodyFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [retrievalUriFixture, documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          retrievalUriFixture,
          resolveIdMock,
        );

        refFixture = {
          $ref: '#/components/requestBodies/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should load the document by its retrieval URI', () => {
          expect(resolveIdMock).toHaveBeenCalledTimes(1);
          expect(resolveIdMock).toHaveBeenCalledWith(retrievalUriFixture);
        });

        it('should resolve the ref against $self', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/requestBodies/Pet',
                  canonicalId: `${selfUriFixture}#/components/requestBodies/Pet`,
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

    describe('having an absolute ref to the entry document $self', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;
      let retrievalUriFixture: string;
      let selfUriFixture: string;

      beforeAll(() => {
        retrievalUriFixture = 'https://git.example.com/blob/main/openapi.yaml';
        selfUriFixture = 'https://example.com/api/openapi';
        requestBodyFixture = {
          content: {},
        };
        documentFixture = {
          $self: selfUriFixture,
          components: {
            requestBodies: {
              Pet: requestBodyFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [retrievalUriFixture, documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          retrievalUriFixture,
          resolveIdMock,
        );

        refFixture = {
          $ref: `${selfUriFixture}#/components/requestBodies/Pet`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should load the document by its retrieval URI', () => {
          expect(resolveIdMock).toHaveBeenCalledTimes(1);
          expect(resolveIdMock).toHaveBeenCalledWith(retrievalUriFixture);
        });

        it('should return the request body identified by $self', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: `${selfUriFixture}#/components/requestBodies/Pet`,
                  canonicalId: `${selfUriFixture}#/components/requestBodies/Pet`,
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

    describe('having a relative ref resolved against $self', () => {
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;
      let retrievalUriFixture: string;
      let selfUriFixture: string;
      let sharedDocumentIdFixture: string;

      beforeAll(() => {
        retrievalUriFixture = 'https://git.example.com/blob/main/openapi.yaml';
        selfUriFixture = 'https://example.com/api/openapi';
        sharedDocumentIdFixture = 'https://example.com/api/shared/foo';
        requestBodyFixture = {
          content: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [
            retrievalUriFixture,
            {
              $self: selfUriFixture,
              info: {
                title: 'Example API',
                version: '1.0',
              },
              openapi: '3.2.0',
            },
          ],
          [
            sharedDocumentIdFixture,
            {
              $self: sharedDocumentIdFixture,
              components: {
                requestBodies: {
                  Foo: requestBodyFixture,
                },
              },
            },
          ],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          retrievalUriFixture,
          resolveIdMock,
        );

        refFixture = {
          $ref: 'shared/foo#/components/requestBodies/Foo',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should load the entry document by retrieval URI and the target by $self', () => {
          expect(resolveIdMock).toHaveBeenCalledWith(retrievalUriFixture);
          expect(resolveIdMock).toHaveBeenCalledWith(sharedDocumentIdFixture);
        });

        it('should return the request body from the document identified by $self', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: 'shared/foo#/components/requestBodies/Foo',
                  canonicalId: `${sharedDocumentIdFixture}#/components/requestBodies/Foo`,
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

    describe('having a relative $self', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;
      let retrievalUriFixture: string;
      let resolvedSelfUriFixture: string;

      beforeAll(() => {
        retrievalUriFixture = 'https://staging.example.com/api/openapi';
        resolvedSelfUriFixture = 'https://staging.example.com/openapi';
        requestBodyFixture = {
          content: {},
        };
        documentFixture = {
          $self: '/openapi',
          components: {
            requestBodies: {
              Pet: requestBodyFixture,
            },
          },
        };

        const documentById: Map<string, JsonValue> = new Map([
          [retrievalUriFixture, documentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          retrievalUriFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should resolve $self against the retrieval URI', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/requestBodies/Pet',
                  canonicalId: `${resolvedSelfUriFixture}#/components/requestBodies/Pet`,
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

    describe('having a ref chain whose second hop is resolved against $self', () => {
      let aliasRefFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let requestBodyFixture: JsonValue;
      let retrievalUriFixture: string;
      let selfUriFixture: string;
      let sharedDocumentIdFixture: string;

      beforeAll(() => {
        retrievalUriFixture = 'https://git.example.com/blob/main/openapi.yaml';
        selfUriFixture = 'https://example.com/api/openapi';
        sharedDocumentIdFixture = 'https://example.com/api/shared/foo';
        requestBodyFixture = {
          content: {},
          required: true,
        };
        aliasRefFixture = {
          $ref: 'shared/foo#/components/requestBodies/Pet',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [
            retrievalUriFixture,
            {
              $self: selfUriFixture,
              components: {
                requestBodies: {
                  Alias: aliasRefFixture,
                },
              },
            },
          ],
          [
            sharedDocumentIdFixture,
            {
              $self: sharedDocumentIdFixture,
              components: {
                requestBodies: {
                  Pet: requestBodyFixture,
                },
              },
            },
          ],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          retrievalUriFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Alias',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should resolve the second hop against the referring document $self', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: '#/components/requestBodies/Alias',
                  canonicalId: `${selfUriFixture}#/components/requestBodies/Alias`,
                  value: refFixture,
                },
                {
                  $ref: 'shared/foo#/components/requestBodies/Pet',
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

    describe('having a ref to a schema document identified by $id', () => {
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;
      let retrievalUriFixture: string;
      let schemaDocumentFixture: JsonValue;
      let schemaIdFixture: string;

      beforeAll(() => {
        retrievalUriFixture = 'file:///tmp/pet.json';
        schemaIdFixture = 'https://example.com/api/schemas/pet';
        schemaDocumentFixture = {
          $id: schemaIdFixture,
          type: 'string',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [retrievalUriFixture, schemaDocumentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          retrievalUriFixture,
          resolveIdMock,
        );

        refFixture = {
          $ref: schemaIdFixture,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should load the document by its retrieval URI', () => {
          expect(resolveIdMock).toHaveBeenCalledTimes(1);
          expect(resolveIdMock).toHaveBeenCalledWith(retrievalUriFixture);
        });

        it('should identify the document by $id', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: schemaIdFixture,
                  canonicalId: schemaIdFixture,
                  value: refFixture,
                },
              ],
              value: schemaDocumentFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a relative ref to a schema document', () => {
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let schemaDocumentFixture: JsonValue;
      let schemaIdFixture: string;

      beforeAll(() => {
        schemaIdFixture = 'https://example.com/api/Pet.yaml';
        schemaDocumentFixture = {
          $id: schemaIdFixture,
          type: 'object',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [
            'https://example.com/api/openapi.json',
            {
              $self: 'https://example.com/api/openapi.json',
              openapi: '3.2.0',
            },
          ],
          [schemaIdFixture, schemaDocumentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          'https://example.com/api/openapi.json',
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: 'Pet.yaml',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the schema document', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: 'Pet.yaml',
                  canonicalId: schemaIdFixture,
                  value: refFixture,
                },
              ],
              value: schemaDocumentFixture,
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having an entry document with an invalid $self URI', () => {
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let selfUriFixture: string;

      beforeAll(() => {
        selfUriFixture = '1https://example.com/openapi';
        refFixture = {
          $ref: '#/components/requestBodies/Pet',
        };

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => ({
            $self: selfUriFixture,
          }),
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: false,
            value: {
              reason: `Invalid $self URI: ${selfUriFixture}`,
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having an entry document with an invalid $self URI and an absolute ref', () => {
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let otherDocumentIdFixture: string;
      let refFixture: JsonValue;
      let selfUriFixture: string;

      beforeAll(() => {
        selfUriFixture = '1https://example.com/openapi';
        otherDocumentIdFixture = 'https://example.com/other.json';
        refFixture = {
          $ref: otherDocumentIdFixture,
        };

        const documentById: Map<string, JsonValue> = new Map([
          [otherDocumentIdFixture, { content: {} }],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          (id: string) => {
            if (id === OPEN_API_DOCUMENT_URI_FIXTURE) {
              return {
                $self: selfUriFixture,
              };
            }

            return documentById.get(id);
          },
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: false,
            value: {
              reason: `Invalid $self URI: ${selfUriFixture}`,
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a referenced document with an invalid $self URI', () => {
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let selfUriFixture: string;
      let sharedDocumentIdFixture: string;

      beforeAll(() => {
        sharedDocumentIdFixture = 'https://example.com/shared.json';
        selfUriFixture = '1https://example.com/shared';
        refFixture = {
          $ref: 'shared.json',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [OPEN_API_DOCUMENT_URI_FIXTURE, { openapi: '3.2.0' }],
          [
            sharedDocumentIdFixture,
            {
              $self: selfUriFixture,
            },
          ],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          (id: string) => documentById.get(id),
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure including the failing hop', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: false,
            value: {
              reason: `Invalid $self URI: ${selfUriFixture}`,
              resolutionContextStack: [
                {
                  $ref: 'shared.json',
                  canonicalId: sharedDocumentIdFixture,
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Alias',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the final request body', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/schemas/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the schema object without following its $ref', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/schemas/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should follow the $ref as an OpenAPI Reference Object', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/paths/~1pets/get/requestBody/content/application~1json/schema',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the schema object without following its $ref', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/paths/~1pets',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the path item object without following its $ref', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/webhooks/newPet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should follow the webhook reference object', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Alias',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should resolve the second hop against the referring document', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/A',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure with the followed chain', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/A',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a circular reference failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        refFixture = {
          $ref: 'https://example.com/missing.json',
        };

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          OPEN_API_DOCUMENT_URI_FIXTURE,
          () => undefined,
        );
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: '#/components/requestBodies/Alias',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure including the missing hop', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          pet: 'Rex',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#Pet`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          components: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/components/requestBodies/Pet`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          pet: 'Rex',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/pet/child`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          pet: 'Rex',
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/pet`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return the primitive target', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/openapi.json';
        documentFixture = {
          empty: null,
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          (id: string) => documentById.get(id),
        );

        refFixture = {
          $ref: `${documentIdFixture}#/empty`,
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a null target', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;

      beforeAll(() => {
        documentIdFixture = 'https://example.com/requestBody.json';
        documentFixture = {
          content: {},
        };

        const documentById: Map<string, JsonValue> = new Map([
          [documentIdFixture, documentFixture],
        ]);

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
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
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should ignore the summary and description properties', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
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
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
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

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          documentIdFixture,
          resolveIdMock,
        );

        refFixture = {
          $ref: documentIdFixture,
        };
      });

      describe('when called twice', () => {
        beforeAll(() => {
          openApi3Dot2Resolver.resolveRef(refFixture);
          openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should load the document only once', () => {
          expect(resolveIdMock).toHaveBeenCalledTimes(1);
          expect(resolveIdMock).toHaveBeenCalledWith(documentIdFixture);
        });
      });
    });

    describe('having an entry document declaring an absolute $self URI', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let petSchemaFixture: JsonValue;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        petSchemaFixture = {
          type: 'object',
        };
        documentFixture = {
          $self: 'https://example.com/v2/api.json',
        };

        const documentById: Map<string, JsonValue> = new Map([
          ['https://example.com/api.json', documentFixture],
          ['https://example.com/v2/schemas/pet.json', petSchemaFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          'https://example.com/api.json',
          resolveIdMock,
        );

        refFixture = {
          $ref: 'schemas/pet.json',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should rebase relative references to the declared $self base URI', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: 'schemas/pet.json',
                  canonicalId: 'https://example.com/v2/schemas/pet.json',
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

    describe('having an entry document declaring a relative $self URI', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let petSchemaFixture: JsonValue;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        petSchemaFixture = {
          type: 'object',
        };
        documentFixture = {
          $self: '../v2/api.json',
        };

        const documentById: Map<string, JsonValue> = new Map([
          ['https://example.com/v1/sub/api.json', documentFixture],
          ['https://example.com/v1/v2/schemas/pet.json', petSchemaFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          'https://example.com/v1/sub/api.json',
          resolveIdMock,
        );

        refFixture = {
          $ref: 'schemas/pet.json',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should resolve the relative $self against retrieval URI and rebase references', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: 'schemas/pet.json',
                  canonicalId: 'https://example.com/v1/v2/schemas/pet.json',
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

    describe('having an entry document declaring a root Schema Object $id', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let petSchemaFixture: JsonValue;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        petSchemaFixture = {
          type: 'object',
        };
        documentFixture = {
          $id: 'https://example.com/schemas/root.json',
        };

        const documentById: Map<string, JsonValue> = new Map([
          ['https://example.com/api.json', documentFixture],
          ['https://example.com/schemas/pet.json', petSchemaFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          'https://example.com/api.json',
          resolveIdMock,
        );

        refFixture = {
          $ref: 'pet.json',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should rebase relative references to the declared $id base URI', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: true,
            value: {
              chain: [
                {
                  $ref: 'pet.json',
                  canonicalId: 'https://example.com/schemas/pet.json',
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

    describe('having a document declaring an invalid non-string $self property', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        documentFixture = {
          $self: 12345,
        };

        const documentById: Map<string, JsonValue> = new Map([
          ['https://example.com/api.json', documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          'https://example.com/api.json',
          resolveIdMock,
        );

        refFixture = {
          $ref: '#/components/schemas/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a resolution failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: false,
            value: {
              reason: 'Invalid $self URI: 12345',
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a document declaring an invalid non-string $id property', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        documentFixture = {
          $id: true,
        };

        const documentById: Map<string, JsonValue> = new Map([
          ['https://example.com/api.json', documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          'https://example.com/api.json',
          resolveIdMock,
        );

        refFixture = {
          $ref: '#/components/schemas/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a resolution failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: false,
            value: {
              reason: 'Invalid $id URI: true',
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a document declaring an unparseable $self URI', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        documentFixture = {
          $self: 'ht tp://invalid',
        };

        const documentById: Map<string, JsonValue> = new Map([
          ['https://example.com/api.json', documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          'https://example.com/api.json',
          resolveIdMock,
        );

        refFixture = {
          $ref: '#/components/schemas/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a resolution failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: false,
            value: {
              reason: 'Invalid $self URI: ht tp://invalid',
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a document declaring an unparseable $id URI', () => {
      let documentFixture: JsonValue;
      let openApi3Dot2Resolver: OpenApi3Dot2Resolver;
      let refFixture: JsonValue;
      let resolveIdMock: Mock<(id: string) => JsonValue | undefined>;

      beforeAll(() => {
        documentFixture = {
          $id: 'ht tp://invalid',
        };

        const documentById: Map<string, JsonValue> = new Map([
          ['https://example.com/api.json', documentFixture],
        ]);

        resolveIdMock = vitest.fn((id: string) => documentById.get(id));

        openApi3Dot2Resolver = new OpenApi3Dot2Resolver(
          'https://example.com/api.json',
          resolveIdMock,
        );

        refFixture = {
          $ref: '#/components/schemas/Pet',
        };
      });

      describe('when called', () => {
        let result: OpenApi3Dot2RefResolutionResult;

        beforeAll(() => {
          result = openApi3Dot2Resolver.resolveRef(refFixture);
        });

        it('should return a resolution failure', () => {
          const expected: OpenApi3Dot2RefResolutionResult = {
            isRight: false,
            value: {
              reason: 'Invalid $id URI: ht tp://invalid',
              resolutionContextStack: [],
            },
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });
  });
});
