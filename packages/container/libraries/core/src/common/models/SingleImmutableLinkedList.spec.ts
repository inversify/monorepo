import { beforeAll, describe, expect, it } from 'vitest';

import { SingleImmutableLinkedList } from './SingleImmutableLinkedList';

describe(SingleImmutableLinkedList, () => {
  let singleImmutableLinkedListFixture: SingleImmutableLinkedList<unknown>;

  beforeAll(() => {
    singleImmutableLinkedListFixture = new SingleImmutableLinkedList({
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

        result = singleImmutableLinkedListFixture.concat(elementFixture);
      });

      it('should return linked list', () => {
        const expected: Partial<SingleImmutableLinkedList<unknown>> = {
          last: {
            elem: elementFixture,
            previous: singleImmutableLinkedListFixture.last,
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
        result = [...singleImmutableLinkedListFixture];
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([
          singleImmutableLinkedListFixture.last.elem,
        ]);
      });
    });
  });
});
