import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { isOpenApi3Dot2ReferenceObject } from './isOpenApi3Dot2ReferenceObject.js';

describe(isOpenApi3Dot2ReferenceObject, () => {
  describe.each<[string, JsonValue, boolean]>([
    [
      'an object with only a $ref property',
      { $ref: '#/components/requestBodies/Pet' },
      true,
    ],
    [
      'an object with $ref, summary, and description properties',
      {
        $ref: '#/components/requestBodies/Pet',
        description: 'A pet',
        summary: 'Pet',
      },
      true,
    ],
    [
      'an object with a $ref property and a schema type',
      {
        $ref: '#/components/schemas/Animal',
        type: 'object',
      },
      false,
    ],
    [
      'an object with a $ref property and a path item operation',
      {
        $ref: '#/components/pathItems/Pet',
        get: {},
      },
      false,
    ],
    ['null', null, false],
    ['a string', '#/components/requestBodies/Pet', false],
    ['an array', [{ $ref: '#/components/requestBodies/Pet' }], false],
    ['an object without a $ref property', { description: 'A pet' }, false],
    ['an object with a non-string $ref property', { $ref: 42 }, false],
  ])(
    'having %s',
    (_name: string, valueFixture: JsonValue, expectedResult: boolean) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = isOpenApi3Dot2ReferenceObject(valueFixture);
        });

        it('should return the expected result', () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
