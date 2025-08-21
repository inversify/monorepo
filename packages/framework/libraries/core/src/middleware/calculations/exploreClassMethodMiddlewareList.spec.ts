import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMethodMiddlewareMetadataReflectKey';
import { exploreClassMethodMiddlewareList } from './exploreClassMethodMiddlewareList';

describe(exploreClassMethodMiddlewareList, () => {
  describe('when called and getOwnReflectMetadata returns undefined', () => {
    let classFixture: NewableFunction;
    let classMethodKeyFixture: string | symbol;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classMethodKeyFixture = 'testMethod';

      result = exploreClassMethodMiddlewareList(
        classFixture,
        classMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        classFixture,
        classMethodMiddlewareMetadataReflectKey,
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
    let middlewareFixtures: NewableFunction[];
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classMethodKeyFixture = 'testMethod';
      middlewareFixtures = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(middlewareFixtures);

      result = exploreClassMethodMiddlewareList(
        classFixture,
        classMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        classFixture,
        classMethodMiddlewareMetadataReflectKey,
        classMethodKeyFixture,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(middlewareFixtures);
    });
  });
});
