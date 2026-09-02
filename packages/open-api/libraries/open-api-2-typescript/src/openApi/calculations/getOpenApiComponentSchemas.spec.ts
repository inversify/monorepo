import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';
import { type JsonSchema } from '@inversifyjs/json-schema-types/2020-12';

import { getOpenApiComponentSchemas } from './getOpenApiComponentSchemas.js';

describe(getOpenApiComponentSchemas, () => {
  describe.each<[string, JsonValue]>([
    ['null', null],
    ['a boolean', true],
    ['an array', []],
    ['an object without components', { info: { title: 'API' } }],
    ['an object with a non-object components value', { components: 'schemas' }],
    [
      'an object with components without schemas',
      { components: { parameters: {} } },
    ],
    [
      'an object with a non-object schemas value',
      { components: { schemas: [] } },
    ],
  ])('having %s', (_: string, documentFixture: JsonValue) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getOpenApiComponentSchemas(documentFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an object with component schemas', () => {
    let documentFixture: JsonValue;
    let schemasFixture: Record<string, JsonSchema>;

    beforeAll(() => {
      schemasFixture = {
        User: {
          type: 'string',
        },
      };
      documentFixture = {
        components: {
          schemas: schemasFixture,
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getOpenApiComponentSchemas(documentFixture);
      });

      it('should return the schemas record', () => {
        expect(result).toBe(schemasFixture);
      });
    });
  });
});
