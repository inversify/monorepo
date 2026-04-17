import { beforeAll, describe, expect, it } from 'vitest';

import { maybeCoerceStringToNullableNumber } from './maybeCoerceStringToNullableNumber.js';

describe(maybeCoerceStringToNullableNumber, () => {
  describe.each<
    [string, Parameters<typeof maybeCoerceStringToNullableNumber>, unknown]
  >([
    ['value is a valid integer string', ['42'], 42],
    ['value is a valid float string', ['3.14'], 3.14],
    ['value is a negative number string', ['-7.5'], -7.5],
    ['value is a non-numeric string', ['abc'], 'abc'],
    ['value is undefined', [undefined], null],
    ['value is an empty string', [''], null],
  ])(
    'having %s',
    (
      _: string,
      parameters: Parameters<typeof maybeCoerceStringToNullableNumber>,
      expected: unknown,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = maybeCoerceStringToNullableNumber(...parameters);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
