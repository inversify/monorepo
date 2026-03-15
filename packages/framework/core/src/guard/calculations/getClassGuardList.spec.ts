import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classGuardMetadataReflectKey } from '../../reflectMetadata/data/classGuardMetadataReflectKey.js';
import { type Guard } from '../models/Guard.js';
import { getClassGuardList } from './getClassGuardList.js';

describe(getClassGuardList, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let classFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};

      result = getClassGuardList(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classGuardMetadataReflectKey,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns an array', () => {
    let classFixture: NewableFunction;
    let classGuardFixtures: ServiceIdentifier<Guard>[];
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classGuardFixtures = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(classGuardFixtures);

      result = getClassGuardList(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classGuardMetadataReflectKey,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(classGuardFixtures);
    });
  });
});
