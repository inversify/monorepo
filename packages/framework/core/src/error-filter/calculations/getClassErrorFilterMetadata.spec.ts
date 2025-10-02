import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey';
import { ErrorFilter } from '../models/ErrorFilter';
import { getClassErrorFilterMetadata } from './getClassErrorFilterMetadata';

describe(getClassErrorFilterMetadata, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let classFixture: NewableFunction;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};

      result = getClassErrorFilterMetadata(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classErrorFilterMetadataReflectKey,
      );
    });

    it('should return an empty Set', () => {
      expect(result).toStrictEqual(new Set());
    });
  });

  describe('when called, and getOwnReflectMetadata() returns a Set', () => {
    let classFixture: NewableFunction;
    let classErrorFilterMetadataFixture: Set<Newable<ErrorFilter>>;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classErrorFilterMetadataFixture = new Set([
        Symbol() as unknown as Newable<ErrorFilter>,
      ]);

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(classErrorFilterMetadataFixture);

      result = getClassErrorFilterMetadata(classFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classErrorFilterMetadataReflectKey,
      );
    });

    it('should return Set<ErrorFilter>', () => {
      expect(result).toBe(classErrorFilterMetadataFixture);
    });
  });
});
