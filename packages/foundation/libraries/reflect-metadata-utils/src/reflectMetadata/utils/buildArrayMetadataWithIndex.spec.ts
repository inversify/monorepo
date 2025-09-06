import { beforeAll, describe, expect, it } from 'vitest';

import { buildArrayMetadataWithIndex } from './buildArrayMetadataWithIndex';

describe(buildArrayMetadataWithIndex, () => {
  describe('when called', () => {
    let newMetadata: number;
    let index: number;
    let arrayMetadata: number[];
    let result: unknown;

    beforeAll(() => {
      newMetadata = 1;
      index = 0;
      arrayMetadata = [2, 3];

      result = buildArrayMetadataWithIndex(newMetadata, index)(arrayMetadata);
    });

    it('should return the array with the new metadata', () => {
      expect(result).toStrictEqual([1, 3]);
    });

    it('should return the same array reference', () => {
      expect(result).toBe(arrayMetadata);
    });
  });
});
