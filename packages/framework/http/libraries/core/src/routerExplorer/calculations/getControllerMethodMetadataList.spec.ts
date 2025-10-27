import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { getControllerMethodMetadataList } from './getControllerMethodMetadataList';

describe(getControllerMethodMetadataList, () => {
  describe('when called, and getReflectMetadata() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getReflectMetadata()', () => {
      expect(getReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerFixture,
        controllerMethodMetadataReflectKey,
      );
    });

    it('should return ControllerMethodMetadata[]', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getReflectMetadata() returns ControllerMethodMetadata[]', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodMetadataFixtures: ControllerMethodMetadata[];
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodMetadataFixtures = [
        Symbol() as unknown as ControllerMethodMetadata,
      ];

      vitest
        .mocked(getReflectMetadata)
        .mockReturnValueOnce(controllerMethodMetadataFixtures);

      result = getControllerMethodMetadataList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getReflectMetadata()', () => {
      expect(getReflectMetadata).toHaveBeenCalledTimes(1);
    });

    it('should return an array', () => {
      expect(result).toBe(controllerMethodMetadataFixtures);
    });
  });
});
