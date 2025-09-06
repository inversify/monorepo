import { beforeAll, describe, expect, it } from 'vitest';

import { buildArrayMetadataWithElement } from './buildArrayMetadataWithElement';

describe(buildArrayMetadataWithElement, () => {
  describe('when called', () => {
    let newMetadata: number;
    let arrayMetadata: number[];
    let result: unknown;

    beforeAll(() => {
      newMetadata = 1;
      arrayMetadata = [2, 3];

      result = buildArrayMetadataWithElement(newMetadata)(arrayMetadata);
    });

    it('should return the array with the new metadata', () => {
      expect(result).toStrictEqual([2, 3, 1]);
    });

    it('should return the same array reference', () => {
      expect(result).toBe(arrayMetadata);
    });
  });
});
