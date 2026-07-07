import { beforeAll, describe, expect, it } from 'vitest';

import { type Resolved } from '../../resolution/models/Resolved.js';
import { resolveFour } from './resolveFour.js';

describe.each<
  [
    string,
    Resolved<number>,
    Resolved<number>,
    Resolved<number>,
    Resolved<number>,
    Resolved<number[]>,
  ]
>([
  ['four values', 1, 2, 3, 4, [1, 2, 3, 4]],
  [
    'three values and one promise',
    1,
    2,
    3,
    Promise.resolve(4),
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'two values, one promise and one value',
    1,
    2,
    Promise.resolve(3),
    4,
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'two values and two promises',
    1,
    2,
    Promise.resolve(3),
    Promise.resolve(4),
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'one value, one promise and two values',
    1,
    Promise.resolve(2),
    3,
    4,
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'one value, one promise, one value and one promise',
    1,
    Promise.resolve(2),
    3,
    Promise.resolve(4),
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'one value, two promises and one value',
    1,
    Promise.resolve(2),
    Promise.resolve(3),
    4,
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'one value and three promises',
    1,
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.resolve(4),
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'one promise and three values',
    Promise.resolve(1),
    2,
    3,
    4,
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'one promise, two values and one promise',
    Promise.resolve(1),
    2,
    3,
    Promise.resolve(4),
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'one promise, one value, one promise and one value',
    Promise.resolve(1),
    2,
    Promise.resolve(3),
    4,
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'one promise, one value and two promises',
    Promise.resolve(1),
    2,
    Promise.resolve(3),
    Promise.resolve(4),
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'two promises and two values',
    Promise.resolve(1),
    Promise.resolve(2),
    3,
    4,
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'two promises, one value and one promise',
    Promise.resolve(1),
    Promise.resolve(2),
    3,
    Promise.resolve(4),
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'three promises and one value',
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    4,
    Promise.resolve([1, 2, 3, 4]),
  ],
  [
    'four promises',
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.resolve(4),
    Promise.resolve([1, 2, 3, 4]),
  ],
])(
  'having %s',
  (
    _: string,
    value1: Resolved<number>,
    value2: Resolved<number>,
    value3: Resolved<number>,
    value4: Resolved<number>,
    expected: Resolved<number[]>,
  ) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveFour(
          value1,
          value2,
          value3,
          value4,
          (a: number, b: number, c: number, d: number) => [a, b, c, d],
        );
      });

      it('should resolve four values', () => {
        expect(result).toStrictEqual(expected);
      });
    });
  },
);
