import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { StatusCode as HttpStatusCode } from '@inversifyjs/framework-core';
import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';
import { StatusCode } from './StatusCode';

describe(StatusCode, () => {
  describe('when called', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let descriptorFixture: PropertyDescriptor;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      descriptorFixture = {
        value: 'value-descriptor-example',
      } as PropertyDescriptor;

      StatusCode(HttpStatusCode.OK)(
        controllerFixture,
        controllerMethodKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call setReflectMetadata', () => {
      expect(setReflectMetadata).toHaveBeenCalledTimes(1);
      expect(setReflectMetadata).toHaveBeenCalledWith(
        controllerFixture.constructor,
        controllerMethodStatusCodeMetadataReflectKey,
        HttpStatusCode.OK,
        controllerMethodKeyFixture,
      );
    });
  });
});
