import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock('../actions/updateMaybeClassMetadataPreDestroy');
vitest.mock('../calculations/handleInjectionError');

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { updateMaybeClassMetadataPreDestroy } from '../actions/updateMaybeClassMetadataPreDestroy';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata';
import { handleInjectionError } from '../calculations/handleInjectionError';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { preDestroy } from './preDestroy';

describe(preDestroy, () => {
  let targetFixture: object;
  let propertyKeyFixture: string | symbol;
  let descriptorFixture: TypedPropertyDescriptor<unknown>;

  beforeAll(() => {
    targetFixture = class Foo {}.prototype;
    propertyKeyFixture = Symbol();
    descriptorFixture = {};
  });

  describe('when caled', () => {
    let updateMaybeClassMetadataPostConstructorResult: Mock<
      (metadata: MaybeClassMetadata) => MaybeClassMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      updateMaybeClassMetadataPostConstructorResult = vitest.fn();

      vitest
        .mocked(updateMaybeClassMetadataPreDestroy)
        .mockReturnValueOnce(updateMaybeClassMetadataPostConstructorResult);

      result = preDestroy()(
        targetFixture,
        propertyKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateMaybeClassMetadataPreDestroy()', () => {
      expect(
        updateMaybeClassMetadataPreDestroy,
      ).toHaveBeenCalledExactlyOnceWith(propertyKeyFixture);
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture.constructor,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        updateMaybeClassMetadataPostConstructorResult,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when caled, and updateOwnReflectMetadata throws an Error', () => {
    let errorFixture: Error;

    let updateMaybeClassMetadataPostConstructorResult: Mock<
      (metadata: MaybeClassMetadata) => MaybeClassMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new Error('error-fixture');

      updateMaybeClassMetadataPostConstructorResult = vitest.fn();

      vitest
        .mocked(updateMaybeClassMetadataPreDestroy)
        .mockReturnValueOnce(updateMaybeClassMetadataPostConstructorResult);

      vitest.mocked(updateOwnReflectMetadata).mockImplementation((): never => {
        throw errorFixture;
      });

      result = preDestroy()(
        targetFixture,
        propertyKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateMaybeClassMetadataPreDestroy()', () => {
      expect(
        updateMaybeClassMetadataPreDestroy,
      ).toHaveBeenCalledExactlyOnceWith(propertyKeyFixture);
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture.constructor,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        updateMaybeClassMetadataPostConstructorResult,
      );
    });

    it('should call handleInjectionError', () => {
      expect(handleInjectionError).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        propertyKeyFixture,
        undefined,
        errorFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
