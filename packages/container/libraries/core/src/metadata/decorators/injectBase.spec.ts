import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import 'reflect-metadata/lite';

vitest.mock('@inversifyjs/reflect-metadata-utils');

vitest.mock('../actions/updateMaybeClassMetadataConstructorArgument', () => ({
  updateMaybeClassMetadataConstructorArgument: vitest.fn(),
}));

vitest.mock('../actions/updateMaybeClassMetadataProperty', () => ({
  updateMaybeClassMetadataProperty: vitest.fn(),
}));

vitest.mock('../calculations/handleInjectionError');

import { Newable } from '@inversifyjs/common';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { updateMaybeClassMetadataConstructorArgument } from '../actions/updateMaybeClassMetadataConstructorArgument';
import { updateMaybeClassMetadataProperty } from '../actions/updateMaybeClassMetadataProperty';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata';
import { handleInjectionError } from '../calculations/handleInjectionError';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { injectBase } from './injectBase';

describe(injectBase, () => {
  let updateMetadataMock: Mock<
    (
      metadata: MaybeClassElementMetadata | undefined,
    ) => MaybeClassElementMetadata
  >;
  let updatePendingClassMetadataCountMock: Mock<
    (
      target: object,
    ) => (metadata: MaybeClassElementMetadata | undefined) => void
  >;

  beforeAll(() => {
    vitest
      .mocked(handleInjectionError)
      .mockImplementation(
        (
          _target: unknown,
          _propertyKey: unknown,
          _indexOrTypedDescriptor: unknown,
          error: unknown,
        ) => {
          throw error;
        },
      );

    updateMetadataMock =
      vitest.fn<
        (
          metadata: MaybeClassElementMetadata | undefined,
        ) => MaybeClassElementMetadata
      >();
    updatePendingClassMetadataCountMock = vitest.fn();
  });

  describe('when called, as property decorator', () => {
    let targetFixture: Newable;
    let updateMaybeClassMetadataPropertyResult: Mock<
      (classMetadata: MaybeClassMetadata) => MaybeClassMetadata
    >;

    beforeAll(() => {
      updateMaybeClassMetadataPropertyResult = vitest.fn();

      vitest
        .mocked(updateMaybeClassMetadataProperty)
        .mockReturnValueOnce(updateMaybeClassMetadataPropertyResult);

      class TargetFixture {
        @injectBase(updateMetadataMock, updatePendingClassMetadataCountMock)
        public foo: string | undefined;
      }

      targetFixture = TargetFixture;
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        updateMaybeClassMetadataPropertyResult,
      );
    });
  });

  describe('when called, as constructor parameter decorator', () => {
    let targetFixture: Newable;
    let updateMaybeClassMetadataConstructorArgumentsResult: Mock<
      (classMetadata: MaybeClassMetadata) => MaybeClassMetadata
    >;

    beforeAll(() => {
      updateMaybeClassMetadataConstructorArgumentsResult = vitest.fn();

      vitest
        .mocked(updateMaybeClassMetadataConstructorArgument)
        .mockReturnValueOnce(
          updateMaybeClassMetadataConstructorArgumentsResult,
        );

      class TargetFixture {
        constructor(
          @injectBase(updateMetadataMock, updatePendingClassMetadataCountMock)
          public foo: string | undefined,
        ) {}
      }

      targetFixture = TargetFixture;
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        updateMaybeClassMetadataConstructorArgumentsResult,
      );
    });
  });

  describe('when called, as non constructor parameter decorator', () => {
    let result: unknown;

    beforeAll(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class TargetFixture {
          public doSomethingWithFoo(
            @injectBase(updateMetadataMock, updatePendingClassMetadataCountMock)
            foo: string | undefined,
          ) {
            console.log(foo ?? '?');
          }
        }
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw an error', () => {
      const expectedPartialError: Partial<InversifyCoreError> = {
        kind: InversifyCoreErrorKind.injectionDecoratorConflict,
        message: `Found an @inject decorator in a non constructor parameter.
Found @inject decorator at method "doSomethingWithFoo" at class "TargetFixture"`,
      };

      expect(result).toBeInstanceOf(Error);
      expect(result).toStrictEqual(
        expect.objectContaining(expectedPartialError),
      );
    });
  });

  describe('when called, as method decorator', () => {
    let targetFixture: Newable;
    let updateMaybeClassMetadataPropertyResult: Mock<
      (classMetadata: MaybeClassMetadata) => MaybeClassMetadata
    >;

    beforeAll(() => {
      updateMaybeClassMetadataPropertyResult = vitest.fn();

      vitest
        .mocked(updateMaybeClassMetadataProperty)
        .mockReturnValueOnce(updateMaybeClassMetadataPropertyResult);

      class TargetFixture {
        @injectBase(updateMetadataMock, updatePendingClassMetadataCountMock)
        public set foo(_value: string | undefined) {
          // setter logic
        }
      }

      targetFixture = TargetFixture;
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        updateMaybeClassMetadataPropertyResult,
      );
    });
  });

  describe('when called, as method decorator on non-setter method', () => {
    let result: unknown;

    beforeAll(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class TargetFixture {
          @injectBase(updateMetadataMock, updatePendingClassMetadataCountMock)
          public foo(): void {
            // method logic
          }
        }
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw an error', () => {
      const expectedPartialError: Partial<InversifyCoreError> = {
        kind: InversifyCoreErrorKind.injectionDecoratorConflict,
        message: `Found an @inject decorator in a non setter property method.
Found @inject decorator at method "foo" at class "TargetFixture"`,
      };

      expect(result).toBeInstanceOf(Error);
      expect(result).toStrictEqual(
        expect.objectContaining(expectedPartialError),
      );
    });

    it('should call handleInjectionError()', () => {
      expect(handleInjectionError).toHaveBeenCalledExactlyOnceWith(
        expect.any(Object),
        'foo',
        expect.any(Object),
        expect.any(Error),
      );
    });
  });
});
