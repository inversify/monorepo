import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { resolvePathItem } from './resolvePathItem.js';

const DOCUMENT_BASE_URI: string = 'urn:test:openapi';

describe(resolvePathItem, () => {
  describe.each<[string, JsonValue]>([
    ['null', null],
    ['a boolean', true],
    ['an array', []],
    ['a string', '/todos'],
  ])('having %s', (_: string, pathItemFixture: JsonValue) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolvePathItem(
          pathItemFixture,
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

  describe('having a path item without $ref', () => {
    let pathItemFixture: JsonValue;

    beforeAll(() => {
      pathItemFixture = {
        get: {
          operationId: 'listTodos',
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolvePathItem(
          pathItemFixture,
          DOCUMENT_BASE_URI,
          () => undefined,
          new Set(),
        );
      });

      it('should return the path item', () => {
        expect(result).toBe(pathItemFixture);
      });
    });
  });

  describe('having a fragment-only $ref against a known document', () => {
    let documentFixture: JsonValue;
    let pathItemFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      pathItemFixture = {
        get: {
          operationId: 'getTodo',
        },
      };
      documentFixture = {
        components: {
          pathItems: {
            TodoItem: pathItemFixture,
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === DOCUMENT_BASE_URI ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolvePathItem(
          {
            $ref: '#/components/pathItems/TodoItem',
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should return the referenced path item', () => {
        expect(result).toStrictEqual(pathItemFixture);
      });
    });
  });

  describe('having a $ref with sibling operations', () => {
    let documentFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      documentFixture = {
        components: {
          pathItems: {
            TodoItem: {
              get: {
                operationId: 'fromTarget',
              },
              parameters: [
                {
                  in: 'path',
                  name: 'id',
                },
              ],
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
        result = resolvePathItem(
          {
            $ref: '#/components/pathItems/TodoItem',
            get: {
              operationId: 'fromSibling',
            },
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should override the target with sibling keys', () => {
        expect(result).toStrictEqual({
          get: {
            operationId: 'fromSibling',
          },
          parameters: [
            {
              in: 'path',
              name: 'id',
            },
          ],
        });
      });
    });
  });

  describe('having a nested $ref', () => {
    let documentFixture: JsonValue;
    let pathItemFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      pathItemFixture = {
        get: {
          operationId: 'getTodo',
        },
      };
      documentFixture = {
        components: {
          pathItems: {
            Alias: {
              $ref: '#/components/pathItems/TodoItem',
            },
            TodoItem: pathItemFixture,
          },
        },
      };
      resolveIdFixture = (id: string): JsonValue | undefined =>
        id === DOCUMENT_BASE_URI ? documentFixture : undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolvePathItem(
          {
            $ref: '#/components/pathItems/Alias',
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should return the terminal path item', () => {
        expect(result).toStrictEqual(pathItemFixture);
      });
    });
  });

  describe('having a cyclic $ref', () => {
    let documentFixture: JsonValue;
    let resolveIdFixture: (id: string) => JsonValue | undefined;

    beforeAll(() => {
      documentFixture = {
        components: {
          pathItems: {
            A: {
              $ref: '#/components/pathItems/B',
            },
            B: {
              $ref: '#/components/pathItems/A',
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
        result = resolvePathItem(
          {
            $ref: '#/components/pathItems/A',
            summary: 'loop',
          },
          DOCUMENT_BASE_URI,
          resolveIdFixture,
          new Set(),
        );
      });

      it('should omit $ref and keep sibling keys', () => {
        expect(result).toStrictEqual({
          summary: 'loop',
        });
      });
    });
  });

  describe('having an unresolvable $ref with sibling operations', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolvePathItem(
          {
            $ref: '#/components/pathItems/Missing',
            get: {
              operationId: 'listTodos',
            },
          },
          DOCUMENT_BASE_URI,
          () => undefined,
          new Set(),
        );
      });

      it('should omit $ref and keep sibling keys', () => {
        expect(result).toStrictEqual({
          get: {
            operationId: 'listTodos',
          },
        });
      });
    });
  });

  describe('having an invalid URI $ref', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolvePathItem(
          {
            $ref: '1http://example.com#/components/pathItems/TodoItem',
            summary: 'kept',
          },
          DOCUMENT_BASE_URI,
          () => undefined,
          new Set(),
        );
      });

      it('should omit $ref and keep sibling keys', () => {
        expect(result).toStrictEqual({
          summary: 'kept',
        });
      });
    });
  });
});
