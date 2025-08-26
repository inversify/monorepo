import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey';
import { exploreClassInterceptorList } from './exploreClassInterceptorList';

describe(exploreClassInterceptorList, () => {
  describe('when called and getOwnReflectMetadata returns undefined', () => {
    let classFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};

      result = exploreClassInterceptorList(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        classFixture,
        classInterceptorMetadataReflectKey,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called and getOwnReflectMetadata returns an array', () => {
    let classFixture: NewableFunction;
    let classInterceptorFixtures: NewableFunction[];
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classInterceptorFixtures = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(classInterceptorFixtures);

      result = exploreClassInterceptorList(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        classFixture,
        classInterceptorMetadataReflectKey,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(classInterceptorFixtures);
    });
  });
});
