import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

import { Right } from '@inversifyjs/common';

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures';
import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures';
import { Binding } from '../../binding/models/Binding';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { BindingType } from '../../binding/models/BindingType';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { ScopedBinding } from '../../binding/models/ScopedBinding';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { DeactivationParams } from '../models/DeactivationParams';
import { Resolved } from '../models/Resolved';
import { resolveBindingPreDestroy } from './resolveBindingPreDestroy';

const CACHE_KEY_TYPE: keyof ScopedBinding<
  BindingType,
  typeof bindingScopeValues.Singleton,
  unknown
> = 'cache';

type CachedSingletonScopedBinding<TResolved> = Binding &
  ScopedBinding<BindingType, typeof bindingScopeValues.Singleton, TResolved> & {
    [CACHE_KEY_TYPE]: Right<Resolved<TResolved>>;
  };

describe(resolveBindingPreDestroy, () => {
  describe('having a binding with non instace type', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let bindingFixture: CachedSingletonScopedBinding<unknown>;

    beforeAll(() => {
      paramsMock = {
        getClassMetadata: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      bindingFixture =
        ConstantValueBindingFixtures.withCacheWithIsRightTrue as CachedSingletonScopedBinding<unknown>;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingPreDestroy(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a binding with instace type and sync cache with no preDestroy method', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let bindingFixture: CachedSingletonScopedBinding<unknown> &
      InstanceBinding<unknown>;

    beforeAll(() => {
      paramsMock = {
        getClassMetadata: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      bindingFixture =
        InstanceBindingFixtures.withCacheIsRightAndScopeSingleton as CachedSingletonScopedBinding<unknown> &
          InstanceBinding<unknown>;
    });

    describe('when called, and params.getClassMetadata() returns ClassMetadata with no preDestroyMethodName', () => {
      let classMetadataFixture: ClassMetadata;

      let result: unknown;

      beforeAll(() => {
        classMetadataFixture = ClassMetadataFixtures.withNoPreDestroyMethodName;

        paramsMock.getClassMetadata.mockReturnValueOnce(classMetadataFixture);

        result = resolveBindingPreDestroy(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getClassMetadata()', () => {
        expect(paramsMock.getClassMetadata).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.implementationType,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and params.getClassMetadata() returns ClassMetadata with preDestroyMethodName', () => {
      let classMetadataFixture: ClassMetadata;

      let result: unknown;

      beforeAll(() => {
        classMetadataFixture = ClassMetadataFixtures.withPreDestroyMethodName;

        paramsMock.getClassMetadata.mockReturnValueOnce(classMetadataFixture);

        result = resolveBindingPreDestroy(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getClassMetadata()', () => {
        expect(paramsMock.getClassMetadata).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.implementationType,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a binding with instace type and async cache with no preDestroy method', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let bindingFixture: CachedSingletonScopedBinding<unknown> &
      InstanceBinding<unknown>;

    beforeAll(() => {
      paramsMock = {
        getClassMetadata: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      bindingFixture =
        InstanceBindingFixtures.withCacheIsRightAndAsyncValueAndScopeSingleton as CachedSingletonScopedBinding<unknown> &
          InstanceBinding<unknown>;
    });

    describe('when called, and params.getClassMetadata() returns ClassMetadata with no preDestroyMethodName', () => {
      let classMetadataFixture: ClassMetadata;

      let result: unknown;

      beforeAll(() => {
        classMetadataFixture = ClassMetadataFixtures.withNoPreDestroyMethodName;

        paramsMock.getClassMetadata.mockReturnValueOnce(classMetadataFixture);

        result = resolveBindingPreDestroy(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getClassMetadata()', () => {
        expect(paramsMock.getClassMetadata).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.implementationType,
        );
      });

      it('should return undefined', () => {
        expect(result).toStrictEqual(Promise.resolve(undefined));
      });
    });
  });

  describe('having a binding with instace type and sync cache with preDestroy method', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let bindingFixture: CachedSingletonScopedBinding<unknown> &
      InstanceBinding<unknown>;
    let preDestroyMethodNameFixture: string;
    let preDestroyMock: Mock<(value: unknown) => void | Promise<void>>;

    beforeAll(() => {
      paramsMock = {
        getClassMetadata: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;

      preDestroyMethodNameFixture = 'preDestroy';
      preDestroyMock = vitest.fn();

      bindingFixture =
        InstanceBindingFixtures.withCacheIsRightAndScopeSingleton as CachedSingletonScopedBinding<unknown> &
          InstanceBinding<unknown>;

      bindingFixture = {
        ...bindingFixture,
        cache: {
          isRight: true,
          value: {
            [preDestroyMethodNameFixture]: preDestroyMock,
          },
        },
      };
    });

    describe('when called, and params.getClassMetadata() returns ClassMetadata with preDestroyMethodName', () => {
      let classMetadataFixture: ClassMetadata;

      let result: unknown;

      beforeAll(() => {
        classMetadataFixture = ClassMetadataFixtures.any;

        classMetadataFixture = {
          ...classMetadataFixture,
          lifecycle: {
            ...classMetadataFixture.lifecycle,
            preDestroyMethodNames: new Set([preDestroyMethodNameFixture]),
          },
        };

        paramsMock.getClassMetadata.mockReturnValueOnce(classMetadataFixture);

        result = resolveBindingPreDestroy(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getClassMetadata()', () => {
        expect(paramsMock.getClassMetadata).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.implementationType,
        );
      });

      it('should call preDestroy() method', () => {
        expect(preDestroyMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
