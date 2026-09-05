import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { errorDiscriminatorMetadataReflectKey } from '../../reflectMetadata/data/errorDiscriminatorMetadataReflectKey.js';
import { getErrorDiscriminatorMetadata } from './getErrorDiscriminatorMetadata.js';

describe(getErrorDiscriminatorMetadata, () => {
  describe('when called', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let expectedResult: (string | symbol)[];
    let result: (string | symbol)[] | undefined;

    beforeAll(() => {
      targetFixture = class TestError extends Error {};
      expectedResult = ['test-error'];

      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(expectedResult);

      result = getErrorDiscriminatorMetadata(targetFixture);
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        errorDiscriminatorMetadataReflectKey,
      );
    });

    it('should return expected discriminators', () => {
      expect(result).toBe(expectedResult);
    });
  });
});
