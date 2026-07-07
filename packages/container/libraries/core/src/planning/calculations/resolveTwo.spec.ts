import { beforeAll, describe, expect, it } from 'vitest';

import { type Resolved } from '../../resolution/models/Resolved.js';
import { resolveTwo } from './resolveTwo.js';

describe.each<[string, Resolved<number>, Resolved<number>, Resolved<number[]>]>(
  [
    ['two values', 1, 2, [1, 2]],
    [
      'two promises',
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve([1, 2]),
    ],
    [
      'one value and one promise',
      1,
      Promise.resolve(2),
      Promise.resolve([1, 2]),
    ],
    [
      'one promise and one value',
      Promise.resolve(1),
      2,
      Promise.resolve([1, 2]),
    ],
  ],
)(
  'having %s',
  (
    _: string,
    value1: Resolved<number>,
    value2: Resolved<number>,
    expected: Resolved<number[]>,
  ) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveTwo(value1, value2, (a: number, b: number) => [a, b]);
      });

      it('should resolve two values', () => {
        expect(result).toStrictEqual(expected);
      });
    });
  },
);
