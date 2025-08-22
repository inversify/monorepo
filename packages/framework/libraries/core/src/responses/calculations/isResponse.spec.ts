import { beforeAll, describe, expect, it } from 'vitest';

import { isResponse as isResponseSymbol } from '../Response';
import { isResponse } from './isResponse';

describe.each<[string, unknown, boolean]>([
  ['valid Response', { [isResponseSymbol]: true, statusCode: 200 }, true],
  ['invalid Response', { statusCode: 200 }, false],
  ['null', null, false],
  ['undefined', undefined, false],
  ['string', 'not an object', false],
])('Having %s', (_: string, input: unknown, expected: boolean) => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = isResponse(input);
    });

    it('should return expected value', () => {
      expect(result).toBe(expected);
    });
  });
});
