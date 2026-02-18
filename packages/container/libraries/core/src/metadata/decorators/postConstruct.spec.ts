import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock(import('../actions/updateMaybeClassMetadataPostConstructor.js'));
vitest.mock(import('../calculations/handleInjectionError.js'));

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { updateMaybeClassMetadataPostConstructor } from '../actions/updateMaybeClassMetadataPostConstructor.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { handleInjectionError } from '../calculations/handleInjectionError.js';
import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';
import { postConstruct } from './postConstruct.js';

describe(postConstruct, () => {
  let targetFixture: object;
  let propertyKeyFixture: string | symbol;
  let descriptorFixture: TypedPropertyDescriptor<unknown>;

  beforeAll(() => {
    targetFixture = class Foo {}.prototype;
    propertyKeyFixture = Symbol();
    descriptorFixture = {};
  });

  describe('when called', () => {
    let updateMaybeClassMetadataPostConstructorResult: Mock<
      (metadata: MaybeClassMetadata) => MaybeClassMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      updateMaybeClassMetadataPostConstructorResult = vitest.fn();

      vitest
        .mocked(updateMaybeClassMetadataPostConstructor)
        .mockReturnValueOnce(updateMaybeClassMetadataPostConstructorResult);

      result = postConstruct()(
        targetFixture,
        propertyKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateMaybeClassMetadataPostConstructor()', () => {
      expect(
        updateMaybeClassMetadataPostConstructor,
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
        .mocked(updateMaybeClassMetadataPostConstructor)
        .mockReturnValueOnce(updateMaybeClassMetadataPostConstructorResult);

      vitest.mocked(updateOwnReflectMetadata).mockImplementation((): never => {
        throw errorFixture;
      });

      result = postConstruct()(
        targetFixture,
        propertyKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateMaybeClassMetadataPostConstructor()', () => {
      expect(
        updateMaybeClassMetadataPostConstructor,
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
