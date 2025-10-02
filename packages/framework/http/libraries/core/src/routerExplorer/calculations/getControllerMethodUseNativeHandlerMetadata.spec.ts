import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';
import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata';

describe(getControllerMethodUseNativeHandlerMetadata, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';

      result = getControllerMethodUseNativeHandlerMetadata(
        controllerFixture,
        controllerMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerFixture,
        controllerMethodUseNativeHandlerMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should return false', () => {
      expect(result).toBe(false);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns a boolean', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let useNativeHandlerFixture: boolean;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      useNativeHandlerFixture = false;

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(useNativeHandlerFixture);

      result = getControllerMethodUseNativeHandlerMetadata(
        controllerFixture,
        controllerMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerFixture,
        controllerMethodUseNativeHandlerMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should return a boolean', () => {
      expect(result).toBe(useNativeHandlerFixture);
    });
  });
});
