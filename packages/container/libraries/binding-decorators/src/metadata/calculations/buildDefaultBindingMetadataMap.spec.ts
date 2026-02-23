import { beforeAll, describe, expect, it } from 'vitest';

import { buildDefaultBindingMetadataMap } from './buildDefaultBindingMetadataMap.js';

describe(buildDefaultBindingMetadataMap, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDefaultBindingMetadataMap();
    });

    it('should return a Map', () => {
      expect(result).toStrictEqual(new Map());
    });
  });
});
