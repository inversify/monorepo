import { beforeAll, describe, expect, it } from 'vitest';

import { buildEmptyMapMetadata } from './buildEmptyMapMetadata';

describe(buildEmptyMapMetadata, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildEmptyMapMetadata();
    });

    it('should return an empty map', () => {
      expect(result).toStrictEqual(new Map());
    });
  });
});
