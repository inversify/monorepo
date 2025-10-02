import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';

describe(getControllerMethodStatusCodeMetadata, () => {
  describe('when called', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let statusCodeMetadataFixture: undefined;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      statusCodeMetadataFixture = undefined;

      result = getControllerMethodStatusCodeMetadata(
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
        controllerMethodStatusCodeMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should return the controller metadata', () => {
      expect(result).toBe(statusCodeMetadataFixture);
    });
  });
});
