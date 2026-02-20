import { beforeAll, describe, expect, it } from 'vitest';

import { isStackOverflowError } from './isStackOverflowError.js';

class InternalError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    this.name = 'InternalError';
  }
}

describe(isStackOverflowError, () => {
  describe.each<[string, unknown, boolean]>([
    [
      'RangeError with "Maximum call stack size exceeded"',
      new RangeError('Maximum call stack size exceeded'),
      true,
    ],
    [
      'RangeError with "call stack size exceeded"',
      new RangeError('call stack size exceeded'),
      true,
    ],
    [
      'RangeError with "Out of stack space"',
      new RangeError('Out of stack space'),
      true,
    ],
    [
      'InternalError with "too much recursion"',
      new InternalError('too much recursion'),
      true,
    ],
    ['Error with unrelated message', new Error('Some other error'), false],
    ['Non-error object', {}, false],
  ])(
    'having an error %s',
    (_: string, errorFixture: unknown, expectedResult: boolean) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = isStackOverflowError(errorFixture);
        });

        it('should return the expected result', () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
