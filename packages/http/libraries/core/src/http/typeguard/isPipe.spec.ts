import { beforeAll, describe, expect, it } from 'vitest';

import { Pipe } from '../pipe/model/Pipe';
import { isPipe } from './isPipe';

describe(isPipe.name, () => {
  describe.each([
    [undefined, false],
    [null, false],
    [{}, false],
    [{ execute: 'not a function' }, false],
    [{ execute: () => {} }, true],
  ])(
    'having a value %s',
    (
      valueFixture: undefined | null | object | { execute: string } | Pipe,
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
