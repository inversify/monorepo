import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { type Newable } from '@inversifyjs/common';
import {
  getOwnReflectMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { typescriptParameterTypesReflectKey } from '../../reflectMetadata/data/typescriptDesignParameterTypesReflectKey.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { updateClassMetadataWithTypescriptParameterTypes } from './updateClassMetadataWithTypescriptParameterTypes.js';

describe(updateClassMetadataWithTypescriptParameterTypes, () => {
  describe('when called, and getOwnReflectMetadata() returns undefined', () => {
    let targetFixture: object;

    let result: unknown;

    beforeAll(() => {
      targetFixture = class {};

      result = updateClassMetadataWithTypescriptParameterTypes(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        typescriptParameterTypesReflectKey,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and getOwnReflectMetadata() returns Newable[]', () => {
    let targetFixture: object;

    let newableListFixture: Newable[];

    let result: unknown;

    beforeAll(() => {
      targetFixture = class {};

      newableListFixture = [];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(newableListFixture);

      result = updateClassMetadataWithTypescriptParameterTypes(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        typescriptParameterTypesReflectKey,
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        expect.any(Function),
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
