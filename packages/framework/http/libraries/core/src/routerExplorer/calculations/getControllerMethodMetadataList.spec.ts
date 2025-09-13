import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { getControllerMethodMetadataList } from './getControllerMethodMetadataList';

describe(getControllerMethodMetadataList, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodMetadataReflectKey,
      );
    });

    it('should return ControllerMethodMetadata[]', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns ControllerMethodMetadata[]', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodMetadataFixtures: ControllerMethodMetadata[];
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodMetadataFixtures = [
        Symbol() as unknown as ControllerMethodMetadata,
      ];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(controllerMethodMetadataFixtures);

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
    });

    it('should return an array', () => {
      expect(result).toBe(controllerMethodMetadataFixtures);
    });
  });
});
