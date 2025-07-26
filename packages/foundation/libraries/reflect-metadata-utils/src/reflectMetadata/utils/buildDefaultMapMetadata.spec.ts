import { beforeAll, describe, expect, it } from 'vitest';

import { buildDefaultMapMetadata } from './buildDefaultMapMetadata';

describe(buildDefaultMapMetadata, () => {
  describe('when called', () => {
    let result: Map<unknown, unknown>;

    beforeAll(() => {
      result = buildDefaultMapMetadata();
    });

    it('should return an empty map', () => {
      expect(result).toStrictEqual(new Map());
    });
  });
});
