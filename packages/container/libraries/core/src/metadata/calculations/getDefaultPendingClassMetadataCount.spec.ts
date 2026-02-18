import { beforeAll, describe, expect, it } from 'vitest';

import { getDefaultPendingClassMetadataCount } from './getDefaultPendingClassMetadataCount.js';

describe(getDefaultPendingClassMetadataCount, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = getDefaultPendingClassMetadataCount();
    });

    it('should return expected value', () => {
      expect(result).toBe(0);
    });
  });
});
