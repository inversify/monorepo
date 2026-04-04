import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';
import { getControllerOpenApiMetadata } from './getControllerOpenApiMetadata.js';

describe(getControllerOpenApiMetadata, () => {
  describe('when called, and getOwnReflectMetadata() returns metadata', () => {
    let targetFixture: object;
    let metadataFixture: ControllerOpenApiMetadata;

    let result: unknown;

    beforeAll(() => {
      targetFixture = class {};
      metadataFixture = Symbol() as unknown as ControllerOpenApiMetadata;

      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(metadataFixture);

      result = getControllerOpenApiMetadata(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        controllerOpenApiMetadataReflectKey,
      );
    });

    it('should return the metadata', () => {
      expect(result).toBe(metadataFixture);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let targetFixture: object;

    let result: unknown;

    beforeAll(() => {
      targetFixture = class {};

      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

      result = getControllerOpenApiMetadata(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        controllerOpenApiMetadataReflectKey,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
