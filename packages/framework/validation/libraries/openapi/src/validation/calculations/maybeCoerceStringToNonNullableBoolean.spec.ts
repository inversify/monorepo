import { beforeAll, describe, expect, it } from 'vitest';

import { maybeCoerceStringToNonNullableBoolean } from './maybeCoerceStringToNonNullableBoolean.js';

describe(maybeCoerceStringToNonNullableBoolean, () => {
  describe.each<
    [string, Parameters<typeof maybeCoerceStringToNonNullableBoolean>, unknown]
  >([
    ['value is "true"', ['true'], true],
    ['value is "false"', ['false'], false],
    ['value is undefined', [undefined], undefined],
    ['value is an arbitrary string', ['yes'], 'yes'],
    ['value is an empty string', [''], ''],
  ])(
    'having %s',
    (
      _: string,
      parameters: Parameters<typeof maybeCoerceStringToNonNullableBoolean>,
      expected: unknown,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = maybeCoerceStringToNonNullableBoolean(...parameters);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
