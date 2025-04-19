import { beforeAll, describe, expect, it } from 'vitest';

import { Newable } from 'inversify';

import { Middleware } from '../middleware/model/Middleware';
import { MiddlewarePhase } from '../middleware/model/MiddlewarePhase';
import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';
import { isApplyMiddlewareOptions } from './isApplyMiddlewareOptions';

class TestMiddleware implements Middleware {
  public execute(_request: Request, _response: Response): void {
    throw new Error('Method not implemented.');
  }
}

describe(isApplyMiddlewareOptions.name, () => {
  describe.each([
    [undefined, false],
    [null, false],
    [{}, false],
    [{ middleware: 'not a function' }, false],
    [{ middleware: () => {} }, false],
    [{ middleware: TestMiddleware, phase: 2 }, false],
    [{ middleware: TestMiddleware, phase: MiddlewarePhase.PreHandler }, true],
  ])(
    'having a value %s',
    (
      valueFixture:
        | undefined
        | null
        | object
        | { middleware: string }
        | { middleware: () => void }
        | { middleware: Newable<Middleware>; phase: number }
        | ApplyMiddlewareOptions,
      expectedResult: boolean,
    ) => {
      describe('when called', () => {
        let result: boolean;

        beforeAll(() => {
          result = isApplyMiddlewareOptions(valueFixture);
        });

        it(`should return ${String(expectedResult)}`, () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
