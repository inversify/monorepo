import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

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

    it('should return an array', () => {
      expect(result).toBe(parameterMetadataListFixture);
    });
  });
});
