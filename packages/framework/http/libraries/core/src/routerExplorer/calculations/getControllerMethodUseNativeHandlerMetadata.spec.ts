import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');
vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

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

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

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

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(controllerFixture);
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
      useNativeHandlerFixture = true;

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

    it('should not call getBaseType()', () => {
      expect(getBaseType).not.toHaveBeenCalled();
    });

    it('should return a boolean', () => {
      expect(result).toBe(useNativeHandlerFixture);
    });
  });

  describe('when called, child has no value but parent has true', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseUseNativeHandlerFixture: boolean;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseUseNativeHandlerFixture = true;

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(baseUseNativeHandlerFixture);

      vitest.mocked(getBaseType).mockReturnValueOnce(baseControllerFixture);

      result = getControllerMethodUseNativeHandlerMetadata(
        controllerFixture,
        controllerMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(2);
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        1,
        controllerFixture,
        controllerMethodUseNativeHandlerMetadataReflectKey,
        controllerMethodKeyFixture,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseControllerFixture,
        controllerMethodUseNativeHandlerMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(controllerFixture);
    });

    it('should return parent value', () => {
      expect(result).toStrictEqual(baseUseNativeHandlerFixture);
    });
  });
});
