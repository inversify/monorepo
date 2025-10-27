import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');
vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { RequestMethodParameterType } from '../../http/models/RequestMethodParameterType';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList';

describe(getControllerMethodParameterMetadataList, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

      result = getControllerMethodParameterMetadataList(
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
        controllerMethodParameterMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(controllerFixture);
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns an array', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let parameterMetadataListFixture: ControllerMethodParameterMetadata[];
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      parameterMetadataListFixture = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(parameterMetadataListFixture);

      result = getControllerMethodParameterMetadataList(
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
        controllerMethodParameterMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should not call getBaseType()', () => {
      expect(getBaseType).not.toHaveBeenCalled();
    });

    it('should return an array', () => {
      expect(result).toBe(parameterMetadataListFixture);
    });
  });

  describe('when called, child has no metadata but parent does', () => {
    let baseControllerFixture: Newable<object>;
    let controllerFixture: Newable;
    let controllerMethodKeyFixture: string | symbol;
    let baseParameterMetadataListFixture: ControllerMethodParameterMetadata[];
    let result: unknown;

    beforeAll(() => {
      baseControllerFixture = class BaseController {};
      controllerFixture = class TestController extends baseControllerFixture {};
      controllerMethodKeyFixture = 'testMethod';

      baseParameterMetadataListFixture = [
        {
          parameterName: 'userId',
          parameterType: RequestMethodParameterType.Params,
          pipeList: [],
        },
      ];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(baseParameterMetadataListFixture);

      vitest.mocked(getBaseType).mockReturnValueOnce(baseControllerFixture);

      result = getControllerMethodParameterMetadataList(
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
        controllerMethodParameterMetadataReflectKey,
        controllerMethodKeyFixture,
      );
      expect(getOwnReflectMetadata).toHaveBeenNthCalledWith(
        2,
        baseControllerFixture,
        controllerMethodParameterMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(controllerFixture);
    });

    it('should return parent metadata', () => {
      expect(result).toStrictEqual(baseParameterMetadataListFixture);
    });
  });
});
