import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey';
import { ErrorFilter } from '../models/ErrorFilter';
import { getClassMethodErrorFilterMetadata } from './getClassMethodErrorFilterMetadata';

describe(getClassMethodErrorFilterMetadata, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let classFixture: NewableFunction;
    let classMethodKeyFixture: string | symbol;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classMethodKeyFixture = 'testMethod';

      result = getClassMethodErrorFilterMetadata(
        classFixture,
        classMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classMethodErrorFilterMetadataReflectKey,
        classMethodKeyFixture,
      );
    });

    it('should return an empty Set', () => {
      expect(result).toStrictEqual(new Set());
    });
  });

  describe('when called, and getOwnReflectMetadata() returns a Set', () => {
    let classFixture: NewableFunction;
    let classMethodKeyFixture: string | symbol;
    let classMethodErrorFilterMetadataFixture: Set<Newable<ErrorFilter>>;
    let result: unknown;

    beforeAll(() => {
      classFixture = class Test {};
      classMethodKeyFixture = 'testMethod';
      classMethodErrorFilterMetadataFixture = new Set([
        Symbol() as unknown as Newable<ErrorFilter>,
      ]);

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(classMethodErrorFilterMetadataFixture);

      result = getClassMethodErrorFilterMetadata(
        classFixture,
        classMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        classFixture,
        classMethodErrorFilterMetadataReflectKey,
        classMethodKeyFixture,
      );
    });

    it('should return a Set<ErrorFilter>', () => {
      expect(result).toBe(classMethodErrorFilterMetadataFixture);
    });
  });
});
