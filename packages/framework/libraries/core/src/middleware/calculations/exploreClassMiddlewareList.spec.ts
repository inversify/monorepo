import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey';
import { exploreClassMiddlewareList } from './exploreClassMiddlewareList';

describe(exploreClassMiddlewareList, () => {
  describe('when called and getOwnReflectMetadata returns undefined', () => {
    let targetFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      targetFixture = class Test {};

      result = exploreClassMiddlewareList(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        targetFixture,
        classMiddlewareMetadataReflectKey,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called and getOwnReflectMetadata returns an array', () => {
    let targetFixture: NewableFunction;
    let middlewareFixtures: NewableFunction[];
    let result: unknown;

    beforeAll(() => {
      targetFixture = class Test {};
      middlewareFixtures = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(middlewareFixtures);

      result = exploreClassMiddlewareList(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        targetFixture,
        classMiddlewareMetadataReflectKey,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(middlewareFixtures);
    });
  });
});
