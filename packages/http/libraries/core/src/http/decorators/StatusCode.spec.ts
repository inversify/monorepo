import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';
import { HttpStatusCode } from '../responses/HttpStatusCode';
import { statusCode } from './StatusCode';

describe(statusCode.name, () => {
  describe('when called', () => {
    let descriptorFixture: PropertyDescriptor;

    beforeAll(() => {
      descriptorFixture = {
        value: 'value-descriptor-example',
      } as PropertyDescriptor;

      statusCode(HttpStatusCode.OK)({} as object, 'key', descriptorFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call setReflectMetadata', () => {
      expect(setReflectMetadata).toHaveBeenCalledTimes(1);
      expect(setReflectMetadata).toHaveBeenCalledWith(
        descriptorFixture.value,
        controllerMethodStatusCodeMetadataReflectKey,
        HttpStatusCode.OK,
      );
    });
  });
});
