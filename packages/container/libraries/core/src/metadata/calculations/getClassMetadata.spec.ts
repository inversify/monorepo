import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./getDefaultClassMetadata.js'));

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { type Newable } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock(import('./getDefaultClassMetadata.js'));
vitest.mock(import('./isPendingClassMetadata.js'));
vitest.mock(import('./throwAtInvalidClassMetadata.js'));
vitest.mock(import('./validateConstructorMetadataArray.js'));

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures.js';
import { type ClassMetadata } from '../models/ClassMetadata.js';
import { getClassMetadata } from './getClassMetadata.js';
import { getDefaultClassMetadata } from './getDefaultClassMetadata.js';
import { isPendingClassMetadata } from './isPendingClassMetadata.js';
import { throwAtInvalidClassMetadata } from './throwAtInvalidClassMetadata.js';
import { validateConstructorMetadataArray } from './validateConstructorMetadataArray.js';

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
