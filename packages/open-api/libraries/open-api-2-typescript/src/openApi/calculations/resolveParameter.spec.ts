import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { resolveParameter } from './resolveParameter.js';

const DOCUMENT_BASE_URI: string = 'urn:test:openapi';

describe(resolveParameter, () => {
  describe.each<[string, JsonValue]>([
    ['null', null],
    ['a boolean', true],
    ['an array', []],
    ['a string', 'query'],
    ['an object without in, name, or $ref', { schema: { type: 'string' } }],
  ])('having %s', (_: string, valueFixture: JsonValue) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          valueFixture,
          DOCUMENT_BASE_URI,
          () => undefined,
          new Set(),
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a parameter object', () => {
    let valueFixture: JsonValue;

    beforeAll(() => {
      valueFixture = {
        in: 'query',
        name: 'page',
        schema: {
          type: 'integer',
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          valueFixture,
          DOCUMENT_BASE_URI,
          () => undefined,
          new Set(),
        );
      });

      it('should return the parameter object', () => {
        expect(result).toBe(valueFixture);
      });
    });
  });

  describe('having a fragment-only $ref against a known document', () => {
    let documentFixture: JsonValue;
    let parameterFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      parameterFixture = {
        in: 'query',
        name: 'page',
        schema: {
          type: 'integer',
        },
      };
      documentFixture = {
        components: {
          parameters: {
            Page: parameterFixture,
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === DOCUMENT_BASE_URI ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          {
            $ref: '#/components/parameters/Page',
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should return the referenced parameter', () => {
        expect(result).toBe(parameterFixture);
      });
    });
  });

  describe('having an absolute $ref against a known document', () => {
    let documentFixture: JsonValue;
    let parameterFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      parameterFixture = {
        in: 'query',
        name: 'page',
      };
      documentFixture = {
        components: {
          parameters: {
            Page: parameterFixture,
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === DOCUMENT_BASE_URI ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          {
            $ref: `${DOCUMENT_BASE_URI}#/components/parameters/Page`,
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should return the referenced parameter', () => {
        expect(result).toBe(parameterFixture);
      });
    });
  });

  describe('having a $ref with description and summary', () => {
    let documentFixture: JsonValue;
    let parameterFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      parameterFixture = {
        in: 'header',
        name: 'X-Request-Id',
      };
      documentFixture = {
        components: {
          parameters: {
            RequestId: parameterFixture,
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === DOCUMENT_BASE_URI ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          {
            $ref: '#/components/parameters/RequestId',
            description: 'Request id',
            summary: 'Id',
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should follow the reference object', () => {
        expect(result).toBe(parameterFixture);
      });
    });
  });

  describe('having an object with $ref and parameter fields', () => {
    let valueFixture: JsonValue;

    beforeAll(() => {
      valueFixture = {
        $ref: '#/components/parameters/Page',
        in: 'query',
        name: 'page',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          valueFixture,
          DOCUMENT_BASE_URI,
          () => undefined,
          new Set(),
        );
      });

      it('should return the object without following $ref', () => {
        expect(result).toBe(valueFixture);
      });
    });
  });

  describe('having a $ref chain', () => {
    let documentFixture: JsonValue;
    let parameterFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      parameterFixture = {
        in: 'query',
        name: 'page',
      };
      documentFixture = {
        components: {
          parameters: {
            Alias: {
              $ref: '#/components/parameters/Page',
            },
            Page: parameterFixture,
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === DOCUMENT_BASE_URI ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          {
            $ref: '#/components/parameters/Alias',
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should return the terminal parameter', () => {
        expect(result).toBe(parameterFixture);
      });
    });
  });

  describe('having a cyclic $ref', () => {
    let documentFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      documentFixture = {
        components: {
          parameters: {
            A: {
              $ref: '#/components/parameters/B',
            },
            B: {
              $ref: '#/components/parameters/A',
            },
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === DOCUMENT_BASE_URI ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          {
            $ref: '#/components/parameters/A',
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an unresolvable $ref', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          {
            $ref: '#/components/parameters/Missing',
          },
          DOCUMENT_BASE_URI,
          () => undefined,
          new Set(),
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an invalid URI $ref', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameter(
          {
            $ref: '1http://example.com#/components/parameters/Page',
          },
          DOCUMENT_BASE_URI,
          () => undefined,
          new Set(),
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
