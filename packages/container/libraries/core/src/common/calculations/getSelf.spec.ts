import { beforeAll, describe, expect, it } from 'vitest';

import { getSelf } from './getSelf';

describe(getSelf.name, () => {
  let value: unknown;

  beforeAll(() => {
    value = Symbol();
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = getSelf(value);
    });

    it('should return expected value', () => {
      expect(result).toBe(value);
    });
  });
});
