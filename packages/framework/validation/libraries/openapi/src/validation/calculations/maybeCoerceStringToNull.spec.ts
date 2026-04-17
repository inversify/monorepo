import { beforeAll, describe, expect, it } from 'vitest';

import { maybeCoerceStringToNull } from './maybeCoerceStringToNull.js';

describe(maybeCoerceStringToNull, () => {
  describe.each<[string, Parameters<typeof maybeCoerceStringToNull>, unknown]>([
    ['value is an empty string', [''], null],
    ['value is undefined', [undefined], null],
    ['value is a non-empty string', ['hello'], 'hello'],
  ])(
    'having %s',
    (
      _: string,
      parameters: Parameters<typeof maybeCoerceStringToNull>,
      expected: unknown,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = maybeCoerceStringToNull(...parameters);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expected);
        });
      });
    },
  );
});
