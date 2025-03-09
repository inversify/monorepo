import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerGuardMetadataReflectKey';
import { controllerMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodGuardMetadataReflectKey';
import { useGuard } from './UseGuard';

describe(useGuard.name, () => {
  describe('having a ClassDecorator', () => {
    describe('when called and getReflectMetadata returns undefined', () => {
      let middlewareFixture: NewableFunction;
      let targetFixture: NewableFunction;

      beforeAll(() => {
        middlewareFixture = {} as NewableFunction;
        targetFixture = class TestController {};

        useGuard(middlewareFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getReflectMetadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledTimes(1);
        expect(getReflectMetadata).toHaveBeenCalledWith(
          targetFixture,
          controllerGuardMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledTimes(1);
        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture,
          controllerGuardMetadataReflectKey,
          [middlewareFixture],
        );
      });
    });
  });

  describe('having a MethodDecorator', () => {
    describe('when called and getReflectMetadata returns a Guard list', () => {
      let middlewareFixture: NewableFunction;
      let descriptorFixture: PropertyDescriptor;

      beforeAll(() => {
        middlewareFixture = {} as NewableFunction;
        descriptorFixture = {
          value: 'value-descriptor-example',
        } as PropertyDescriptor;

        vitest.mocked(getReflectMetadata).mockReturnValueOnce([]);

        useGuard(middlewareFixture)({}, 'key', descriptorFixture);
      });

      it('should call getReflectMetadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledTimes(1);
        expect(getReflectMetadata).toHaveBeenCalledWith(
          descriptorFixture.value,
          controllerMethodGuardMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledTimes(1);
        expect(setReflectMetadata).toHaveBeenCalledWith(
          descriptorFixture.value,
          controllerMethodGuardMetadataReflectKey,
          [middlewareFixture],
        );
      });
    });
  });
});
