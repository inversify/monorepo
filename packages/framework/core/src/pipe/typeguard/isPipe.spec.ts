import { beforeAll, describe, expect, it } from 'vitest';

import { Pipe } from '../models/Pipe';
import { isPipe } from './isPipe';

describe(isPipe, () => {
  describe.each([
    [undefined, false],
    [null, false],
    [{}, false],
    [{ execute: 'not a function' }, false],
    [{ execute: () => {} }, true],
  ])(
    'having a value %s',
    (
      valueFixture: undefined | null | object | Pipe,
      expectedResult: boolean,
    ) => {
      describe('when called', () => {
        let result: boolean;

        beforeAll(() => {
          result = isPipe(valueFixture);
        });

        it(`should return ${String(expectedResult)}`, () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
