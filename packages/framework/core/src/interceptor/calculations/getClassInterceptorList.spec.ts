import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ServiceIdentifier } from 'inversify';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey';
import { Interceptor } from '../models/Interceptor';
import { getClassInterceptorList } from './getClassInterceptorList';

describe(getClassInterceptorList, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let classFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};

      result = getClassInterceptorList(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classInterceptorMetadataReflectKey,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns an array', () => {
    let classFixture: NewableFunction;
    let classInterceptorFixtures: ServiceIdentifier<Interceptor>[];
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classInterceptorFixtures = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(classInterceptorFixtures);

      result = getClassInterceptorList(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classInterceptorMetadataReflectKey,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(classInterceptorFixtures);
    });
  });
});
