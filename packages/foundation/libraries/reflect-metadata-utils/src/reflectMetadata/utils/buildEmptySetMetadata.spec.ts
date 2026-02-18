import { beforeAll, describe, expect, it } from 'vitest';

import { buildEmptySetMetadata } from './buildEmptySetMetadata.js';

describe(buildEmptySetMetadata, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildEmptySetMetadata();
    });

    it('should return new Set', () => {
      expect(result).toStrictEqual(new Set());
    });
  });
});
