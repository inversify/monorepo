import { beforeAll, describe, expect, it } from 'vitest';

import { maybeCoerceStringToNonNullableNumber } from './maybeCoerceStringToNonNullableNumber.js';

describe(maybeCoerceStringToNonNullableNumber, () => {
  describe.each<
    [string, Parameters<typeof maybeCoerceStringToNonNullableNumber>, unknown]
  >([
    ['value is a valid integer string', ['42'], 42],
    ['value is a valid float string', ['3.14'], 3.14],
    ['value is a negative number string', ['-7.5'], -7.5],
    ['value is a non-numeric string', ['abc'], 'abc'],
    ['value is undefined', [undefined], undefined],
    ['value is an empty string', [''], ''],
  ])(
    'having %s',
    (
      _: string,
      parameters: Parameters<typeof maybeCoerceStringToNonNullableNumber>,
      expected: unknown,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = maybeCoerceStringToNonNullableNumber(...parameters);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
