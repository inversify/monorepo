import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/core'));

import { type ServiceIdentifier } from '@inversifyjs/common';
import {
  type ActivationsService,
  type BindingActivation,
  type BindingDeactivation,
  type BindingScope,
  bindingScopeValues,
  type BindingService,
  type DeactivationParams,
  type DeactivationsService,
  type PlanResultCacheService,
  resolveModuleDeactivations,
} from '@inversifyjs/core';

import { type BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax.js';
import { type BindingIdentifier } from '../../binding/models/BindingIdentifier.js';
import { InversifyContainerError } from '../../error/models/InversifyContainerError.js';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind.js';
import {
  type ContainerModule,
  type ContainerModuleLoadOptions,
} from '../models/ContainerModule.js';
import { type IsBoundOptions } from '../models/isBoundOptions.js';
import { type BindingManager } from './BindingManager.js';
import { ContainerModuleManager } from './ContainerModuleManager.js';
import { type PlanResultCacheManager } from './PlanResultCacheManager.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';

describe(ContainerModuleManager, () => {
  let bindingManagerMock: Mocked<BindingManager>;
  let deactivationParamsFixture: DeactivationParams;
  let defaultScopeFixture: BindingScope;
  let planResultCacheManagerMock: Mocked<PlanResultCacheManager>;
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;

  beforeAll(() => {
    bindingManagerMock = {
      bind: vitest.fn(),
      isBound: vitest.fn(),
      isCurrentBound: vitest.fn(),
      rebind: vitest.fn(),
      rebindAsync: vitest.fn(),
      unbind: vitest.fn(),
      unbindAllAsync: vitest.fn(),
      unbindAsync: vitest.fn(),
    } as Partial<Mocked<BindingManager>> as Mocked<BindingManager>;
    deactivationParamsFixture = Symbol() as unknown as DeactivationParams;
    defaultScopeFixture = bindingScopeValues.Singleton;
    planResultCacheManagerMock = {
      invalidateService: vitest.fn(),
    } as Partial<
      Mocked<PlanResultCacheManager>
    > as Mocked<PlanResultCacheManager>;
    serviceReferenceManagerMock = {
      activationService: {
        removeAllByModuleId: vitest.fn(),
      } as Partial<ActivationsService>,
      bindingService: {
        removeAllByModuleId: vitest.fn(),
      } as Partial<BindingService>,
      deactivationService: {
        removeAllByModuleId: vitest.fn(),
      } as Partial<DeactivationsService>,
      planResultCacheService: {
        clearCache: vitest.fn(),
      } as Partial<PlanResultCacheService>,
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;
  });

  describe('.loadAsync', () => {
    let asyncContainerModuleMock: Mocked<ContainerModule>;
    let syncContainerModuleMock: Mocked<ContainerModule>;

    beforeAll(() => {
      asyncContainerModuleMock = {
        load: vitest.fn().mockResolvedValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;

      syncContainerModuleMock = {
        load: vitest.fn().mockReturnValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;
    });

    describe('when called with an async module', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await new ContainerModuleManager(
          bindingManagerMock,
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).loadAsync(asyncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModule.load()', () => {
        const options: ContainerModuleLoadOptions = {
          bind: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          isBound: expect.any(Function) as unknown as (
            serviceIdentifier: ServiceIdentifier,
            options?: IsBoundOptions,
          ) => boolean,
          onActivation: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
            activation: BindingActivation<T>,
          ) => void,
          onDeactivation: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
            activation: BindingDeactivation<T>,
          ) => void,
          rebind: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          rebindAsync: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => Promise<BindToFluentSyntax<T>>,
          unbind: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => void,
          unbindAsync: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => Promise<void>,
        };

        expect(asyncContainerModuleMock.load).toHaveBeenCalledExactlyOnceWith(
          options,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with a sync module', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await new ContainerModuleManager(
          bindingManagerMock,
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).loadAsync(syncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModule.load()', () => {
        const options: ContainerModuleLoadOptions = {
          bind: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          isBound: expect.any(Function) as unknown as (
            serviceIdentifier: ServiceIdentifier,
            options?: IsBoundOptions,
          ) => boolean,
          onActivation: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
            activation: BindingActivation<T>,
          ) => void,
          onDeactivation: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
            activation: BindingDeactivation<T>,
          ) => void,
          rebind: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          rebindAsync: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => Promise<BindToFluentSyntax<T>>,
          unbind: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => void,
          unbindAsync: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => Promise<void>,
        };

        expect(syncContainerModuleMock.load).toHaveBeenCalledExactlyOnceWith(
          options,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.load', () => {
    let syncContainerModuleMock: Mocked<ContainerModule>;
    let asyncContainerModuleMock: Mocked<ContainerModule>;

    beforeAll(() => {
      syncContainerModuleMock = {
        load: vitest.fn().mockReturnValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;

      asyncContainerModuleMock = {
        load: vitest.fn().mockResolvedValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;
    });

    describe('when called with a sync module', () => {
      let result: unknown;

      beforeAll(() => {
        result = new ContainerModuleManager(
          bindingManagerMock,
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).load(syncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModule.load()', () => {
        const options: ContainerModuleLoadOptions = {
          bind: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          isBound: expect.any(Function) as unknown as (
            serviceIdentifier: ServiceIdentifier,
            options?: IsBoundOptions,
          ) => boolean,
          onActivation: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
            activation: BindingActivation<T>,
          ) => void,
          onDeactivation: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
            activation: BindingDeactivation<T>,
          ) => void,
          rebind: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          rebindAsync: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => Promise<BindToFluentSyntax<T>>,
          unbind: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => void,
          unbindAsync: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => Promise<void>,
        };

        expect(syncContainerModuleMock.load).toHaveBeenCalledExactlyOnceWith(
          options,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with an async module', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          new ContainerModuleManager(
            bindingManagerMock,
            deactivationParamsFixture,
            defaultScopeFixture,
            planResultCacheManagerMock,
            serviceReferenceManagerMock,
          ).load(asyncContainerModuleMock);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModule.load()', () => {
        const options: ContainerModuleLoadOptions = {
          bind: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          isBound: expect.any(Function) as unknown as (
            serviceIdentifier: ServiceIdentifier,
            options?: IsBoundOptions,
          ) => boolean,
          onActivation: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
            activation: BindingActivation<T>,
          ) => void,
          onDeactivation: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
            activation: BindingDeactivation<T>,
          ) => void,
          rebind: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          rebindAsync: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => Promise<BindToFluentSyntax<T>>,
          unbind: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => void,
          unbindAsync: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => Promise<void>,
        };

        expect(asyncContainerModuleMock.load).toHaveBeenCalledExactlyOnceWith(
          options,
        );
      });

      it('should throw an InversifyContainerError', () => {
        const expectedErrorProperties: Partial<InversifyContainerError> = {
          kind: InversifyContainerErrorKind.invalidOperation,
          message:
            'Unexpected asynchronous module load. Consider using container.loadAsync() instead.',
        };

        expect(result).toBeInstanceOf(InversifyContainerError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('.unloadAsync', () => {
    let syncContainerModuleMock: Mocked<ContainerModule>;
    let asyncContainerModuleMock: Mocked<ContainerModule>;

    beforeAll(() => {
      syncContainerModuleMock = {
        id: 1,
        load: vitest.fn().mockReturnValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;

      asyncContainerModuleMock = {
        id: 2,
        load: vitest.fn().mockResolvedValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;
    });

    describe('when called with a sync module', () => {
      let result: unknown;

      beforeAll(async () => {
        vitest.mocked(resolveModuleDeactivations).mockReturnValue(undefined);

        result = await new ContainerModuleManager(
          bindingManagerMock,
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).unloadAsync(syncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveModuleDeactivations()', () => {
        expect(resolveModuleDeactivations).toHaveBeenCalledExactlyOnceWith(
          deactivationParamsFixture,
          syncContainerModuleMock.id,
        );
      });

      it('should call activationService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.activationService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(syncContainerModuleMock.id);
      });

      it('should call bindingService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(syncContainerModuleMock.id);
      });

      it('should call deactivationService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(syncContainerModuleMock.id);
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(
          serviceReferenceManagerMock.planResultCacheService.clearCache,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with an async module', () => {
      let result: unknown;

      beforeAll(async () => {
        vitest
          .mocked(resolveModuleDeactivations)
          .mockResolvedValue(undefined as never);

        result = await new ContainerModuleManager(
          bindingManagerMock,
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).unloadAsync(asyncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveModuleDeactivations()', () => {
        expect(resolveModuleDeactivations).toHaveBeenCalledExactlyOnceWith(
          deactivationParamsFixture,
          asyncContainerModuleMock.id,
        );
      });

      it('should call activationService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.activationService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(asyncContainerModuleMock.id);
      });

      it('should call bindingService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(asyncContainerModuleMock.id);
      });

      it('should call deactivationService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(asyncContainerModuleMock.id);
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(
          serviceReferenceManagerMock.planResultCacheService.clearCache,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.unload', () => {
    let syncContainerModuleMock: Mocked<ContainerModule>;
    let asyncContainerModuleMock: Mocked<ContainerModule>;

    beforeAll(() => {
      syncContainerModuleMock = {
        id: 1,
        load: vitest.fn().mockReturnValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;

      asyncContainerModuleMock = {
        id: 2,
        load: vitest.fn().mockResolvedValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;
    });

    describe('when called with a sync module', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(resolveModuleDeactivations).mockReturnValue(undefined);

        result = new ContainerModuleManager(
          bindingManagerMock,
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).unload(syncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveModuleDeactivations()', () => {
        expect(resolveModuleDeactivations).toHaveBeenCalledExactlyOnceWith(
          deactivationParamsFixture,
          syncContainerModuleMock.id,
        );
      });

      it('should call activationService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.activationService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(syncContainerModuleMock.id);
      });

      it('should call bindingService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(syncContainerModuleMock.id);
      });

      it('should call deactivationService.removeAllByModuleId()', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.removeAllByModuleId,
        ).toHaveBeenCalledExactlyOnceWith(syncContainerModuleMock.id);
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(
          serviceReferenceManagerMock.planResultCacheService.clearCache,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with an async module', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(resolveModuleDeactivations)
          .mockResolvedValue(undefined as never);

        try {
          new ContainerModuleManager(
            bindingManagerMock,
            deactivationParamsFixture,
            defaultScopeFixture,
            planResultCacheManagerMock,
            serviceReferenceManagerMock,
          ).unload(asyncContainerModuleMock);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveModuleDeactivations()', () => {
        expect(resolveModuleDeactivations).toHaveBeenCalledExactlyOnceWith(
          deactivationParamsFixture,
          asyncContainerModuleMock.id,
        );
      });

      it('should throw an InversifyContainerError', () => {
        const expectedErrorProperties: Partial<InversifyContainerError> = {
          kind: InversifyContainerErrorKind.invalidOperation,
          message:
            'Unexpected asynchronous module unload. Consider using container.unloadAsync() instead.',
        };

        expect(result).toBeInstanceOf(InversifyContainerError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
