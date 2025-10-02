import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { getControllerMetadataList } from './getControllerMetadataList';

describe(getControllerMetadataList, () => {
  describe('when called', () => {
    let controllerMetadataFixture: undefined;
    let result: unknown;

    beforeAll(() => {
      controllerMetadataFixture = undefined;

      result = getControllerMetadataList();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Reflect,
        controllerMetadataReflectKey,
      );
    });

    it('should return the controller metadata', () => {
      expect(result).toBe(controllerMetadataFixture);
    });
  });
});
