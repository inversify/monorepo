import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { resolveOpenApiDocumentRef } from './resolveOpenApiDocumentRef.js';

describe(resolveOpenApiDocumentRef, () => {
  describe('having a fragment-only $ref against a known document', () => {
    let documentFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      documentFixture = {
        components: {
          parameters: {
            Page: {
              in: 'query',
              name: 'page',
            },
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === 'urn:test:openapi' ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveOpenApiDocumentRef(
          '#/components/parameters/Page',
          'urn:test:openapi',
          resolveIdFixture,
        );
      });

      it('should return the referenced value', () => {
        expect(result).toStrictEqual({
          in: 'query',
          name: 'page',
        });
      });
    });
  });

  describe('having an absolute $ref against a known document', () => {
    let documentFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      documentFixture = {
        components: {
          parameters: {
            Page: {
              in: 'query',
              name: 'page',
            },
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === 'https://example.com/openapi.json' ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveOpenApiDocumentRef(
          'https://example.com/openapi.json#/components/parameters/Page',
          'https://example.com/openapi.json',
          resolveIdFixture,
        );
      });

      it('should return the referenced value', () => {
        expect(result).toStrictEqual({
          in: 'query',
          name: 'page',
        });
      });
    });
  });

  describe('having an absolute $ref that is not in the document map', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveOpenApiDocumentRef(
          'https://example.com/other.json#/components/parameters/Page',
          'https://example.com/openapi.json',
          () => undefined,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an invalid URI', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveOpenApiDocumentRef(
          '1http://example.com#/components/parameters/Page',
          'urn:test:openapi',
          () => undefined,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a $ref with a missing JSON Pointer', () => {
    let documentFixture: JsonValue;

    beforeAll(() => {
      documentFixture = {
        components: {
          parameters: {},
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveOpenApiDocumentRef(
          '#/components/parameters/Missing',
          'urn:test:openapi',
          (id: string): JsonValue | undefined =>
            id === 'urn:test:openapi' ? documentFixture : undefined,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
