import { beforeAll, describe, expect, it } from 'vitest';

import { SingleInmutableLinkedList } from './SingleInmutableLinkedList';

describe(SingleInmutableLinkedList.name, () => {
  let singleInmutableLinkedListFixture: SingleInmutableLinkedList<unknown>;

  beforeAll(() => {
    singleInmutableLinkedListFixture = new SingleInmutableLinkedList({
      elem: Symbol(),
      previous: undefined,
    });
  });

  describe('.concat', () => {
    describe('when called', () => {
      let elementFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        elementFixture = Symbol();

        result = singleInmutableLinkedListFixture.concat(elementFixture);
      });

      it('should return linked list', () => {
        const expected: Partial<SingleInmutableLinkedList<unknown>> = {
          last: {
            elem: elementFixture,
            previous: singleInmutableLinkedListFixture.last,
          },
        };

        expect(result).toStrictEqual(expect.objectContaining(expected));
      });
    });
  });

  describe('[Symbol.iterator]', () => {
    describe('when called', () => {
      let result: Iterable<unknown>;

      beforeAll(() => {
        result = [...singleInmutableLinkedListFixture];
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([
          singleInmutableLinkedListFixture.last.elem,
        ]);
      });
    });
  });
});
