import { beforeAll, describe, expect, it } from 'vitest';

import { isHttpResponse as isHttpResponseSymbol } from '../models/HttpResponse';
import { isHttpResponse } from './isHttpResponse';

describe.each<[string, unknown, boolean]>([
  [
    'valid HttpResponse',
    { [isHttpResponseSymbol]: true, statusCode: 200 },
    true,
  ],
  ['invalid HttpResponse', { statusCode: 200 }, false],
  ['null', null, false],
  ['undefined', undefined, false],
  ['string', 'not an object', false],
])('Having %s', (_: string, input: unknown, expected: boolean) => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = isHttpResponse(input);
    });

    it('should return expected value', () => {
      expect(result).toBe(expected);
    });
  });
});
