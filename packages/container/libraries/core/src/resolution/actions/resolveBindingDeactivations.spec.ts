import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('./resolveBindingPreDestroy');
vitest.mock('./resolveBindingServiceDeactivations');

import { Right } from '@inversifyjs/common';

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures';
import { Binding } from '../../binding/models/Binding';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { BindingType } from '../../binding/models/BindingType';
import { ScopedBinding } from '../../binding/models/ScopedBinding';
import { DeactivationParams } from '../models/DeactivationParams';
import { Resolved } from '../models/Resolved';
import { resolveBindingDeactivations } from './resolveBindingDeactivations';
import { resolveBindingPreDestroy } from './resolveBindingPreDestroy';
import { resolveBindingServiceDeactivations } from './resolveBindingServiceDeactivations';

const CACHE_KEY_TYPE: keyof ScopedBinding<
  BindingType,
  typeof bindingScopeValues.Singleton,
  unknown
> = 'cache';

type CachedSingletonScopedBinding<TResolved> = Binding &
  ScopedBinding<BindingType, typeof bindingScopeValues.Singleton, TResolved> & {
    [CACHE_KEY_TYPE]: Right<Resolved<TResolved>>;
  };

describe(resolveBindingDeactivations, () => {
  describe('having a binding with no deactivation', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let bindingFixture: CachedSingletonScopedBinding<unknown>;

    beforeAll(() => {
      paramsMock = {
        getBindings: vitest.fn(),
        getDeactivations: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      bindingFixture =
        ConstantValueBindingFixtures.withCacheWithIsRightTrueAndOnDeactivationUndefined as CachedSingletonScopedBinding<unknown>;
    });

    describe('when called, and resolveBindingPreDestroy() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingDeactivations(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveBindingPreDestroy()', () => {
        expect(resolveBindingPreDestroy).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture,
        );
      });

      it('should call resolveBindingServiceDeactivations()', () => {
        const bindingCache: Right<Resolved<unknown>> = bindingFixture.cache;

        expect(
          resolveBindingServiceDeactivations,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture.serviceIdentifier,
          bindingCache.value,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and resolveBindingPreDestroy() returns Promise', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(resolveBindingPreDestroy)
          .mockResolvedValueOnce(undefined);

        result = resolveBindingDeactivations(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveBindingPreDestroy()', () => {
        expect(resolveBindingPreDestroy).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture,
        );
      });

      it('should call resolveBindingServiceDeactivations()', () => {
        const bindingCache: Right<Resolved<unknown>> = bindingFixture.cache;

        expect(
          resolveBindingServiceDeactivations,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture.serviceIdentifier,
          bindingCache.value,
        );
      });

      it('should return undefined', () => {
        expect(result).toStrictEqual(Promise.resolve(undefined));
      });
    });
  });

  describe('having a binding with sync deactivation', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let bindingFixture: CachedSingletonScopedBinding<unknown>;

    beforeAll(() => {
      paramsMock = {
        getBindings: vitest.fn(),
        getDeactivations: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      bindingFixture =
        ConstantValueBindingFixtures.withCacheWithIsRightTrueAndOnDeactivationSync as CachedSingletonScopedBinding<unknown>;
    });

    describe('when called, and resolveBindingPreDestroy() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingDeactivations(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveBindingPreDestroy()', () => {
        expect(resolveBindingPreDestroy).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture,
        );
      });

      it('should call resolveBindingServiceDeactivations()', () => {
        const bindingCache: Right<Resolved<unknown>> = bindingFixture.cache;

        expect(
          resolveBindingServiceDeactivations,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture.serviceIdentifier,
          bindingCache.value,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a binding async cached value and sync deactivation', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let bindingFixture: CachedSingletonScopedBinding<unknown>;

    beforeAll(() => {
      paramsMock = {
        getBindings: vitest.fn(),
        getDeactivations: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      bindingFixture =
        ConstantValueBindingFixtures.withCacheWithIsRightTrueAndAsyncValueAndOnDeactivationSync as CachedSingletonScopedBinding<unknown>;
    });

    describe('when called, and resolveBindingPreDestroy() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingDeactivations(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveBindingPreDestroy()', () => {
        expect(resolveBindingPreDestroy).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture,
        );
      });

      it('should call resolveBindingServiceDeactivations()', async () => {
        const bindingCache: Right<Resolved<unknown>> = bindingFixture.cache;

        expect(
          resolveBindingServiceDeactivations,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture.serviceIdentifier,
          await bindingCache.value,
        );
      });

      it('should return Promise', () => {
        expect(result).toStrictEqual(Promise.resolve(undefined));
      });
    });
  });

  describe('having a binding with async deactivation', () => {
    let paramsMock: Mocked<DeactivationParams>;
    let bindingFixture: CachedSingletonScopedBinding<unknown>;

    beforeAll(() => {
      paramsMock = {
        getBindings: vitest.fn(),
        getDeactivations: vitest.fn(),
      } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
      bindingFixture =
        ConstantValueBindingFixtures.withCacheWithIsRightTrueOnDeactivationAsync as CachedSingletonScopedBinding<unknown>;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingDeactivations(paramsMock, bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveBindingServiceDeactivations()', () => {
        const bindingCache: Right<Resolved<unknown>> = bindingFixture.cache;

        expect(
          resolveBindingServiceDeactivations,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture.serviceIdentifier,
          bindingCache.value,
        );
      });

      it('should return Promise', () => {
        expect(result).toStrictEqual(Promise.resolve(undefined));
      });
    });
  });
});
