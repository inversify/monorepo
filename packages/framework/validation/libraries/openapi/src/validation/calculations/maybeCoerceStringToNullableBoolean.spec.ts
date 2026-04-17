import { beforeAll, describe, expect, it } from 'vitest';

import { maybeCoerceStringToNullableBoolean } from './maybeCoerceStringToNullableBoolean.js';

describe(maybeCoerceStringToNullableBoolean, () => {
  describe.each<
    [string, Parameters<typeof maybeCoerceStringToNullableBoolean>, unknown]
  >([
    ['value is "true"', ['true'], true],
    ['value is "false"', ['false'], false],
    ['value is an empty string', [''], null],
    ['value is undefined', [undefined], null],
    ['value is an arbitrary string', ['yes'], 'yes'],
  ])(
    'having %s',
    (
      _: string,
      parameters: Parameters<typeof maybeCoerceStringToNullableBoolean>,
      expected: unknown,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = maybeCoerceStringToNullableBoolean(...parameters);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
