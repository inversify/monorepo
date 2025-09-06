import { beforeAll, describe, expect, it } from 'vitest';

import { buildEmptyArrayMetadata } from './buildEmptyArrayMetadata';

describe(buildEmptyArrayMetadata, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildEmptyArrayMetadata();
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });
});
