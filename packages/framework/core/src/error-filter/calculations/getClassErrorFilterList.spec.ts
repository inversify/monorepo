import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey';
import { getClassErrorFilterList } from './getClassErrorFilterList';

describe(getClassErrorFilterList, () => {
  describe('when called and getOwnReflectMetadata returns undefined', () => {
    let classFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};

      result = getClassErrorFilterList(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        classFixture,
        classErrorFilterMetadataReflectKey,
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called and getOwnReflectMetadata returns an array', () => {
    let classFixture: NewableFunction;
    let classErrorFilterFixtures: NewableFunction[];
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classErrorFilterFixtures = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(classErrorFilterFixtures);

      result = getClassErrorFilterList(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        classFixture,
        classErrorFilterMetadataReflectKey,
      );
    });

    it('should return an array', () => {
      expect(result).toBe(classErrorFilterFixtures);
    });
  });
});
