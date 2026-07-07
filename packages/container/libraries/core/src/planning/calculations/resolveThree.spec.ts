import { beforeAll, describe, expect, it } from 'vitest';

import { type Resolved } from '../../resolution/models/Resolved.js';
import { resolveThree } from './resolveThree.js';

describe.each<
  [
    string,
    Resolved<number>,
    Resolved<number>,
    Resolved<number>,
    Resolved<number[]>,
  ]
>([
  ['three values', 1, 2, 3, [1, 2, 3]],
  [
    'two values and one promise',
    1,
    2,
    Promise.resolve(3),
    Promise.resolve([1, 2, 3]),
  ],
  [
    'one value, one promise and one value',
    1,
    Promise.resolve(2),
    3,
    Promise.resolve([1, 2, 3]),
  ],
  [
    'one value and two promises',
    1,
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.resolve([1, 2, 3]),
  ],
  [
    'one promise and two values',
    Promise.resolve(1),
    2,
    3,
    Promise.resolve([1, 2, 3]),
  ],
  [
    'one promise, one value and one promise',
    Promise.resolve(1),
    2,
    Promise.resolve(3),
    Promise.resolve([1, 2, 3]),
  ],
  [
    'two promises and one value',
    Promise.resolve(1),
    Promise.resolve(2),
    3,
    Promise.resolve([1, 2, 3]),
  ],
  [
    'three promises',
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.resolve([1, 2, 3]),
  ],
])(
  'having %s',
  (
    _: string,
    value1: Resolved<number>,
    value2: Resolved<number>,
    value3: Resolved<number>,
    expected: Resolved<number[]>,
  ) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveThree(
          value1,
          value2,
          value3,
          (a: number, b: number, c: number) => [a, b, c],
        );
      });

      it('should resolve three values', () => {
        expect(result).toStrictEqual(expected);
      });
    });
  },
);
