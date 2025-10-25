import { beforeAll, describe, expect, it } from 'vitest';

import { WeakList } from './WeakList';

describe(WeakList, () => {
  describe('.push', () => {
    describe('when called, and gc is triggered', () => {
      let firstReferencedObject: object;
      let lastReferencedObject: object;

      let weakList: WeakList<object>;

      beforeAll(async () => {
        firstReferencedObject = { id: -1 };
        lastReferencedObject = { id: 10 };

        weakList = new WeakList<object>();

        weakList.push(firstReferencedObject);

        for (let i: number = 0; i < 10; ++i) {
          weakList.push({ id: i });
        }

        weakList.push(lastReferencedObject);
      });

      describe('when iterated', () => {
        let result: unknown;

        beforeAll(async () => {
          await new Promise<void>((resolve: () => void) =>
            setImmediate(resolve),
          );

          if (globalThis.gc === undefined) {
            throw new Error(
              'Garbage collector is not exposed. Run the tests with the --expose-gc flag.',
            );
          }

          globalThis.gc();

          result = Array.from(weakList);
        });

        it('should return an array with non collected objects', () => {
          expect(result).toStrictEqual([
            firstReferencedObject,
            lastReferencedObject,
          ]);
        });
      });
    });
  });
});
