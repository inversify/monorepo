import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type TraverseJsonSchemaCallbackParams } from '@inversifyjs/json-schema-utils/2020-12';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { traverseOpenApiObjectJsonSchemas } from '@inversifyjs/open-api-utils/v3Dot1';

import { OPEN_API_3_DOT_1_DOCUMENT_URI } from '../models/openApiDocumentUri.js';
import { buildOpenApiUriToSchemaMap } from './buildOpenApiUriToSchemaMap.js';

describe(buildOpenApiUriToSchemaMap, () => {
  describe('having an OpenAPI document without $self or schema $id values', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;

    beforeAll(() => {
      openApiObjectFixture = {
        components: {
          schemas: {
            User: {
              type: 'string',
            },
          },
        },
        info: {
          title: 'API',
          version: '1.0.0',
        },
        openapi: '3.1.0',
      };
    });

    describe('when called', () => {
      let result: ReturnType<typeof buildOpenApiUriToSchemaMap>;

      beforeAll(() => {
        result = buildOpenApiUriToSchemaMap(
          openApiObjectFixture as unknown as JsonValue,
          OPEN_API_3_DOT_1_DOCUMENT_URI,
          undefined,
          (
            callback: (params: TraverseJsonSchemaCallbackParams) => void,
          ): void => {
            traverseOpenApiObjectJsonSchemas(openApiObjectFixture, callback);
          },
        );
      });

      it('should use the fallback document URI', () => {
        expect(result.documentBaseUri).toBe(OPEN_API_3_DOT_1_DOCUMENT_URI);
      });

      it('should index the document under the fallback URI', () => {
        expect(result.uriToSchemaMap.get(OPEN_API_3_DOT_1_DOCUMENT_URI)).toBe(
          openApiObjectFixture,
        );
      });
    });
  });

  describe('having a declared document URI', () => {
    let declaredDocumentUriFixture: string;
    let openApiObjectFixture: JsonValue;

    beforeAll(() => {
      declaredDocumentUriFixture = 'https://example.com/openapi.json';
      openApiObjectFixture = {
        components: {
          schemas: {},
        },
        info: {
          title: 'API',
          version: '1.0.0',
        },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: ReturnType<typeof buildOpenApiUriToSchemaMap>;

      beforeAll(() => {
        result = buildOpenApiUriToSchemaMap(
          openApiObjectFixture,
          OPEN_API_3_DOT_1_DOCUMENT_URI,
          declaredDocumentUriFixture,
          () => undefined,
        );
      });

      it('should use the declared document URI as the base', () => {
        expect(result.documentBaseUri).toBe(declaredDocumentUriFixture);
      });

      it('should index the document under both URIs', () => {
        expect(result.uriToSchemaMap.get(OPEN_API_3_DOT_1_DOCUMENT_URI)).toBe(
          openApiObjectFixture,
        );
        expect(result.uriToSchemaMap.get(declaredDocumentUriFixture)).toBe(
          openApiObjectFixture,
        );
      });
    });
  });

  describe('having a relative declared document URI', () => {
    let openApiObjectFixture: JsonValue;

    beforeAll(() => {
      openApiObjectFixture = {
        info: {
          title: 'API',
          version: '1.0.0',
        },
        openapi: '3.2.0',
      };
    });

    describe('when called', () => {
      let result: ReturnType<typeof buildOpenApiUriToSchemaMap>;

      beforeAll(() => {
        result = buildOpenApiUriToSchemaMap(
          openApiObjectFixture,
          'https://example.com/specs/openapi.json',
          'api.json',
          () => undefined,
        );
      });

      it('should resolve the declared URI against the fallback URI', () => {
        expect(result.documentBaseUri).toBe(
          'https://example.com/specs/api.json',
        );
        expect(
          result.uriToSchemaMap.get('https://example.com/specs/api.json'),
        ).toBe(openApiObjectFixture);
        expect(result.uriToSchemaMap.get('api.json')).toBe(
          openApiObjectFixture,
        );
      });
    });
  });

  describe('having component schemas with absolute and relative $id values', () => {
    let addressSchemaFixture: JsonValue;
    let openApiObjectFixture: OpenApi3Dot1Object;
    let userSchemaFixture: JsonValue;

    beforeAll(() => {
      addressSchemaFixture = {
        $id: 'https://example.com/schemas/address.json',
        type: 'string',
      };
      userSchemaFixture = {
        $id: 'user.json',
        type: 'object',
      };
      openApiObjectFixture = {
        components: {
          schemas: {
            Address: addressSchemaFixture,
            User: userSchemaFixture,
          },
        },
        info: {
          title: 'API',
          version: '1.0.0',
        },
        openapi: '3.1.0',
      };
    });

    describe('when called', () => {
      let result: ReturnType<typeof buildOpenApiUriToSchemaMap>;

      beforeAll(() => {
        result = buildOpenApiUriToSchemaMap(
          openApiObjectFixture as unknown as JsonValue,
          'https://example.com/openapi.json',
          'https://example.com/openapi.json',
          (
            callback: (params: TraverseJsonSchemaCallbackParams) => void,
          ): void => {
            traverseOpenApiObjectJsonSchemas(openApiObjectFixture, callback);
          },
        );
      });

      it('should index absolute and document-relative schema $id values', () => {
        expect(
          result.uriToSchemaMap.get('https://example.com/schemas/address.json'),
        ).toBe(addressSchemaFixture);
        expect(result.uriToSchemaMap.get('https://example.com/user.json')).toBe(
          userSchemaFixture,
        );
      });
    });
  });
});
