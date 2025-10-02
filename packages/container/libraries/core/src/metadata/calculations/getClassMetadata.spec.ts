import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./getDefaultClassMetadata');

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { Newable } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock('./getDefaultClassMetadata');
vitest.mock('./isPendingClassMetadata');
vitest.mock('./throwAtInvalidClassMetadata');
vitest.mock('./validateConstructorMetadataArray');

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures';
import { ClassMetadata } from '../models/ClassMetadata';
import { getClassMetadata } from './getClassMetadata';
import { getDefaultClassMetadata } from './getDefaultClassMetadata';
import { isPendingClassMetadata } from './isPendingClassMetadata';
import { throwAtInvalidClassMetadata } from './throwAtInvalidClassMetadata';
import { validateConstructorMetadataArray } from './validateConstructorMetadataArray';

describe(getClassMetadata, () => {
  let typeFixture: Newable;

  beforeAll(() => {
    typeFixture = class Foo {};
  });

  describe('when called, and getOwnReflectMetadata() returns ClassMetadata and isPendingClassMetadata() returns true', () => {
    let errorFixture: Error;
    let metadataFixture: ClassMetadata;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new Error('error-fixture-message');
      metadataFixture = ClassMetadataFixtures.any;

      vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(metadataFixture);

      vitest.mocked(isPendingClassMetadata).mockReturnValueOnce(true);

      vitest
        .mocked(throwAtInvalidClassMetadata)
        .mockImplementationOnce((): never => {
          throw errorFixture;
        });

      try {
        getClassMetadata(typeFixture);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        classMetadataReflectKey,
      );
    });

    it('should not call getDefaultClassMetadata()', () => {
      expect(getDefaultClassMetadata).not.toHaveBeenCalled();
    });

    it('should call throwAtInvalidClassMetadata()', () => {
      expect(throwAtInvalidClassMetadata).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        metadataFixture,
      );
    });

    it('should throw expected Error', () => {
      expect(result).toBe(errorFixture);
    });
  });

  describe('when called, and getOwnReflectMetadata() returns undefined, and isPendingClassMetadata() returns false', () => {
    let metadataFixture: ClassMetadata;

    let result: unknown;

    beforeAll(() => {
      metadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        properties: new Map(),
        scope: undefined,
      };

      vitest
        .mocked(getDefaultClassMetadata)
        .mockReturnValueOnce(metadataFixture);

      vitest.mocked(isPendingClassMetadata).mockReturnValueOnce(false);

      result = getClassMetadata(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        classMetadataReflectKey,
      );
    });

    it('should call getDefaultClassMetadata()', () => {
      expect(getDefaultClassMetadata).toHaveBeenCalledExactlyOnceWith();
    });

    it('should call validateConstructorMetadataArray()', () => {
      expect(validateConstructorMetadataArray).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        metadataFixture.constructorArguments,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(metadataFixture);
    });
  });
});
