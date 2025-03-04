import { beforeAll, describe, expect, it } from 'vitest';

import { Newable } from '@inversifyjs/common';

import { isUserlandEmittedType } from './isUserlandEmittedType';

describe(isUserlandEmittedType.name, () => {
  describe.each<[string, Newable, boolean]>([
    ['Array', Array, false],
    ['BigInt', BigInt as unknown as Newable, false],
    ['Boolean', Boolean, false],
    ['Function', Function, false],
    ['Number', Number, false],
    ['Object', Object, false],
    ['String', String, false],
    ['custom class', class {}, true],
  ])('having %s', (_: string, type: Newable, expectedResult: boolean) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isUserlandEmittedType(type);
      });

      it('should return the expected result', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });
});
