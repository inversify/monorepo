import { beforeAll, describe, expect, it } from 'vitest';

import { maybeCoerceStringToNonNullableInteger } from './maybeCoerceStringToNonNullableInteger.js';

describe(maybeCoerceStringToNonNullableInteger, () => {
  describe.each<
    [string, Parameters<typeof maybeCoerceStringToNonNullableInteger>, unknown]
  >([
    ['value is a valid integer string', ['42'], 42],
    ['value is a negative integer string', ['-7'], -7],
    ['value is a float string', ['3.14'], 3],
    ['value is a non-numeric string', ['abc'], 'abc'],
    ['value is undefined', [undefined], undefined],
    ['value is an empty string', [''], ''],
  ])(
    'having %s',
    (
      _: string,
      parameters: Parameters<typeof maybeCoerceStringToNonNullableInteger>,
      expected: unknown,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = maybeCoerceStringToNonNullableInteger(...parameters);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
