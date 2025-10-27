import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');
vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { RequestMethodType } from '../../http/models/RequestMethodType';
import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { getControllerMethodMetadataList } from './getControllerMethodMetadataList';

describe(getControllerMethodMetadataList, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerFixture,
        controllerMethodMetadataReflectKey,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(controllerFixture);
    });

    it('should return ControllerMethodMetadata[]', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns ControllerMethodMetadata[]', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodMetadataFixture: ControllerMethodMetadata;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodMetadataFixture = {
        methodKey: 'testMethod',
        path: '/test',
        requestMethodType: RequestMethodType.Get,
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce([controllerMethodMetadataFixture]);

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(controllerFixture);
    });

    it('should return an array', () => {
      expect(result).toStrictEqual([controllerMethodMetadataFixture]);
    });
  });

  describe('when called, getOwnReflectMetadata() returns ControllerMethodMetadata[] with no collisions and getBaseType() returns base class', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let baseMetadataFixture: ControllerMethodMetadata;
    let derivedMetadataFixture: ControllerMethodMetadata;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};

      baseMetadataFixture = {
        methodKey: 'baseMethod',
        path: '/base',
        requestMethodType: RequestMethodType.Get,
      };
      derivedMetadataFixture = {
        methodKey: 'derivedMethod',
        path: '/derived',
        requestMethodType: RequestMethodType.Post,
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce([derivedMetadataFixture])
        .mockReturnValueOnce([baseMetadataFixture]);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(2);
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        1,
        controllerFixture,
        controllerMethodMetadataReflectKey,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseControllerFixture,
        controllerMethodMetadataReflectKey,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledTimes(2);
      expect(getBaseType).toHaveBeenNthCalledWith(1, controllerFixture);
      expect(getBaseType).toHaveBeenNthCalledWith(2, baseControllerFixture);
    });

    it('should return expected result', () => {
      expect(result).toStrictEqual([
        derivedMetadataFixture,
        baseMetadataFixture,
      ]);
    });
  });

  describe('when called, getOwnReflectMetadata() returns ControllerMethodMetadata[] with colliding requestMethodType and path, and getBaseType() returns base class', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let baseMetadataFixture: ControllerMethodMetadata;
    let derivedMetadataFixture: ControllerMethodMetadata;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};

      baseMetadataFixture = {
        methodKey: 'baseMethod',
        path: '/users',
        requestMethodType: RequestMethodType.Get,
      };
      derivedMetadataFixture = {
        methodKey: 'derivedMethod',
        path: '/users',
        requestMethodType: RequestMethodType.Get,
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce([derivedMetadataFixture])
        .mockReturnValueOnce([baseMetadataFixture]);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(2);
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        1,
        controllerFixture,
        controllerMethodMetadataReflectKey,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseControllerFixture,
        controllerMethodMetadataReflectKey,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledTimes(2);
      expect(getBaseType).toHaveBeenNthCalledWith(1, controllerFixture);
      expect(getBaseType).toHaveBeenNthCalledWith(2, baseControllerFixture);
    });

    it('should return expected result with child metadata taking precedence', () => {
      expect(result).toStrictEqual([derivedMetadataFixture]);
    });
  });

  describe('when called, getOwnReflectMetadata() returns ControllerMethodMetadata[] with same methodKey but different routes, and getBaseType() returns base class', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let baseMetadataFixture: ControllerMethodMetadata;
    let derivedMetadataFixture: ControllerMethodMetadata;
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};

      baseMetadataFixture = {
        methodKey: 'handleRequest',
        path: '/users',
        requestMethodType: RequestMethodType.Get,
      };
      derivedMetadataFixture = {
        methodKey: 'handleRequest',
        path: '/users',
        requestMethodType: RequestMethodType.Post,
      };

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce([derivedMetadataFixture])
        .mockReturnValueOnce([baseMetadataFixture]);

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(baseControllerFixture)
        .mockReturnValueOnce(undefined);

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(2);
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        1,
        controllerFixture,
        controllerMethodMetadataReflectKey,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseControllerFixture,
        controllerMethodMetadataReflectKey,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledTimes(2);
      expect(getBaseType).toHaveBeenNthCalledWith(1, controllerFixture);
      expect(getBaseType).toHaveBeenNthCalledWith(2, baseControllerFixture);
    });

    it('should return expected result', () => {
      expect(result).toStrictEqual([
        derivedMetadataFixture,
        baseMetadataFixture,
      ]);
    });
  });
});
