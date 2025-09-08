import { beforeAll, describe, expect, it } from 'vitest';

import { updateSetMetadataWithList } from './updateSetMetadataWithList';

describe(updateSetMetadataWithList, () => {
  describe('when called', () => {
    let newMetadata: Iterable<number>;
    let setMetadata: Set<number>;
    let result: unknown;

    beforeAll(() => {
      newMetadata = [1, 2];
      setMetadata = new Set([3, 4]);

      result = updateSetMetadataWithList(newMetadata)(setMetadata);
    });

    it('should return the set with the new metadata', () => {
      expect(result).toStrictEqual(new Set([3, 4, 1, 2]));
    });

    it('should return the same array reference', () => {
      expect(result).toBe(setMetadata);
    });
  });
});
