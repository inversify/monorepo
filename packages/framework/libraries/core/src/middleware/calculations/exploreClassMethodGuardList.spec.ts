import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/classMethodGuardMetadataReflectKey';
import { exploreClassMethodGuardList } from './exploreClassMethodGuardList';

describe(exploreClassMethodGuardList, () => {
  describe('when called and getOwnReflectMetadata returns undefined', () => {
    let classFixture: NewableFunction;
    let classMethodKeyFixture: string | symbol;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classMethodKeyFixture = 'testMethod';

      result = exploreClassMethodGuardList(classFixture, classMethodKeyFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        classFixture,
        classMethodGuardMetadataReflectKey,
        classMethodKeyFixture,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called and getOwnReflectMetadata returns an array', () => {
    let classFixture: NewableFunction;
    let classMethodKeyFixture: string | symbol;
    let classMethodGuardFixtures: NewableFunction[];
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classMethodKeyFixture = 'testMethod';
      classMethodGuardFixtures = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(classMethodGuardFixtures);

      result = exploreClassMethodGuardList(classFixture, classMethodKeyFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        classFixture,
        classMethodGuardMetadataReflectKey,
        classMethodKeyFixture,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(classMethodGuardFixtures);
    });
  });
});
