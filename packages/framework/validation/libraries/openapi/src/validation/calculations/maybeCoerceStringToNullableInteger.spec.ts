import { beforeAll, describe, expect, it } from 'vitest';

import { maybeCoerceStringToNullableInteger } from './maybeCoerceStringToNullableInteger.js';

describe(maybeCoerceStringToNullableInteger, () => {
  describe.each<
    [string, Parameters<typeof maybeCoerceStringToNullableInteger>, unknown]
  >([
    ['value is a valid integer string', ['42'], 42],
    ['value is a negative integer string', ['-7'], -7],
    ['value is a float string', ['3.14'], 3],
    ['value is a non-numeric string', ['abc'], 'abc'],
    ['value is undefined', [undefined], null],
    ['value is an empty string', [''], null],
  ])(
    'having %s',
    (
      _: string,
      parameters: Parameters<typeof maybeCoerceStringToNullableInteger>,
      expected: unknown,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = maybeCoerceStringToNullableInteger(...parameters);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
