import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerGuardMetadataReflectKey';
import { exploreControllerGuardList } from './exploreControllerGuardList';

describe(exploreControllerGuardList.name, () => {
  describe('when called and getOwnReflectMetadata returns undefined', () => {
    let controllerFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};

      result = exploreControllerGuardList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        controllerFixture,
        controllerGuardMetadataReflectKey,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called and getOwnReflectMetadata returns an array', () => {
    let controllerFixture: NewableFunction;
    let controllerGuardFixtures: NewableFunction[];
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerGuardFixtures = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(controllerGuardFixtures);

      result = exploreControllerGuardList(controllerFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        controllerFixture,
        controllerGuardMetadataReflectKey,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(controllerGuardFixtures);
    });
  });
});
