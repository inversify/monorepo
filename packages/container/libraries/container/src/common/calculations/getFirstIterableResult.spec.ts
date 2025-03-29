import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('../actions/getFirstIteratorResult');

import { getFirstIteratorResult } from '../actions/getFirstIteratorResult';
import { getFirstIterableResult } from './getFirstIterableResult';

describe(getFirstIterableResult.name, () => {
  describe('having undefined value', () => {
    describe('when called', () => {
      let resultFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        resultFixture = Symbol();

        vitest
          .mocked(getFirstIteratorResult)
          .mockReturnValueOnce(resultFixture);

        result = getFirstIterableResult(undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getFirstIteratorResult()', () => {
        expect(getFirstIteratorResult).toHaveBeenCalledTimes(1);
        expect(getFirstIteratorResult).toHaveBeenCalledWith(undefined);
      });

      it('should return expected value', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });

  describe('having iterable value', () => {
    let iterableMock: Mocked<Iterable<unknown>>;

    beforeAll(() => {
      iterableMock = {
        [Symbol.iterator]: vitest.fn(),
      };
    });

    describe('when called', () => {
      let iteratorFixture: Iterator<unknown>;
      let resultFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        iteratorFixture = Symbol() as unknown as Iterator<unknown>;
        resultFixture = Symbol();

        iterableMock[Symbol.iterator].mockReturnValueOnce(iteratorFixture);

        vitest
          .mocked(getFirstIteratorResult)
          .mockReturnValueOnce(resultFixture);

        result = getFirstIterableResult(iterableMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call iterable[Symbol.iterator]()', () => {
        expect(iterableMock[Symbol.iterator]).toHaveBeenCalledTimes(1);
        expect(iterableMock[Symbol.iterator]).toHaveBeenCalledWith();
      });

      it('should call getFirstIteratorResult()', () => {
        expect(getFirstIteratorResult).toHaveBeenCalledTimes(1);
        expect(getFirstIteratorResult).toHaveBeenCalledWith(iteratorFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
