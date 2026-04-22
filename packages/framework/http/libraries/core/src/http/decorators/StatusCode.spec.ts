import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey.js';
import { HttpStatusCode } from '../models/HttpStatusCode.js';
import { StatusCode } from './StatusCode.js';

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
      };

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
      expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerFixture.constructor,
        controllerMethodStatusCodeMetadataReflectKey,
        HttpStatusCode.OK,
        controllerMethodKeyFixture,
      );
    });
  });
});
