import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('@inversifyjs/reflect-metadata-utils');

import { updateReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

jest.mock('../actions/updateMaybeClassMetadataPostConstructor');
jest.mock('../calculations/getDefaultClassMetadata');
jest.mock('../calculations/handleInjectionError');

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { updateMaybeClassMetadataPostConstructor } from '../actions/updateMaybeClassMetadataPostConstructor';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata';
import { handleInjectionError } from '../calculations/handleInjectionError';
import { ClassMetadata } from '../models/ClassMetadata';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { postConstruct } from './postConstruct';

describe(postConstruct.name, () => {
  let targetFixture: object;
  let propertyKeyFixture: string | symbol;
  let descriptorFixture: TypedPropertyDescriptor<unknown>;

  beforeAll(() => {
    targetFixture = class Foo {}.prototype;
    propertyKeyFixture = Symbol();
    descriptorFixture = {};
  });

  describe('when caled', () => {
    let classMetadataFixture: ClassMetadata;

    let updateMaybeClassMetadataPostConstructorResult: jest.Mock<
      (metadata: MaybeClassMetadata) => MaybeClassMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      classMetadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        properties: new Map(),
      };

      updateMaybeClassMetadataPostConstructorResult = jest.fn();

      (
        getDefaultClassMetadata as jest.Mock<typeof getDefaultClassMetadata>
      ).mockReturnValueOnce(classMetadataFixture);

      (
        updateMaybeClassMetadataPostConstructor as jest.Mock<
          typeof updateMaybeClassMetadataPostConstructor
        >
      ).mockReturnValueOnce(updateMaybeClassMetadataPostConstructorResult);

      result = postConstruct()(
        targetFixture,
        propertyKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call getDefaultClassMetadata()', () => {
      expect(getDefaultClassMetadata).toHaveBeenCalledTimes(1);
      expect(getDefaultClassMetadata).toHaveBeenCalledWith();
    });

    it('should call updateMaybeClassMetadataPostConstructor()', () => {
      expect(updateMaybeClassMetadataPostConstructor).toHaveBeenCalledTimes(1);
      expect(updateMaybeClassMetadataPostConstructor).toHaveBeenCalledWith(
        propertyKeyFixture,
      );
    });

    it('should call updateReflectMetadata()', () => {
      expect(updateReflectMetadata).toHaveBeenCalledTimes(1);
      expect(updateReflectMetadata).toHaveBeenCalledWith(
        targetFixture.constructor,
        classMetadataReflectKey,
        classMetadataFixture,
        updateMaybeClassMetadataPostConstructorResult,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when caled, and updateReflectMetadata throws an Error', () => {
    let classMetadataFixture: ClassMetadata;
    let errorFixture: Error;

    let updateMaybeClassMetadataPostConstructorResult: jest.Mock<
      (metadata: MaybeClassMetadata) => MaybeClassMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      classMetadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        properties: new Map(),
      };

      errorFixture = new Error('error-fixture');

      updateMaybeClassMetadataPostConstructorResult = jest.fn();

      (
        getDefaultClassMetadata as jest.Mock<typeof getDefaultClassMetadata>
      ).mockReturnValueOnce(classMetadataFixture);

      (
        updateMaybeClassMetadataPostConstructor as jest.Mock<
          typeof updateMaybeClassMetadataPostConstructor
        >
      ).mockReturnValueOnce(updateMaybeClassMetadataPostConstructorResult);

      (
        updateReflectMetadata as jest.Mock<typeof updateReflectMetadata>
      ).mockImplementation((): never => {
        throw errorFixture;
      });

      result = postConstruct()(
        targetFixture,
        propertyKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call getDefaultClassMetadata()', () => {
      expect(getDefaultClassMetadata).toHaveBeenCalledTimes(1);
      expect(getDefaultClassMetadata).toHaveBeenCalledWith();
    });

    it('should call updateMaybeClassMetadataPostConstructor()', () => {
      expect(updateMaybeClassMetadataPostConstructor).toHaveBeenCalledTimes(1);
      expect(updateMaybeClassMetadataPostConstructor).toHaveBeenCalledWith(
        propertyKeyFixture,
      );
    });

    it('should call updateReflectMetadata()', () => {
      expect(updateReflectMetadata).toHaveBeenCalledTimes(1);
      expect(updateReflectMetadata).toHaveBeenCalledWith(
        targetFixture.constructor,
        classMetadataReflectKey,
        classMetadataFixture,
        updateMaybeClassMetadataPostConstructorResult,
      );
    });

    it('should call handleInjectionError', () => {
      expect(handleInjectionError).toHaveBeenCalledTimes(1);
      expect(handleInjectionError).toHaveBeenCalledWith(
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