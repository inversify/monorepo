import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

import { ServiceIdentifier } from '@inversifyjs/common';
import {
  ActivationsService,
  BindingActivation,
  BindingDeactivation,
  BindingScope,
  bindingScopeValues,
  BindingService,
  DeactivationParams,
  DeactivationsService,
  PlanResultCacheService,
} from '@inversifyjs/core';

import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { BindingIdentifier } from '../../binding/models/BindingIdentifier';
import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import {
  ContainerModule,
  ContainerModuleLoadOptions,
} from '../models/ContainerModule';
import { IsBoundOptions } from '../models/isBoundOptions';
import { BindingManager } from './BindingManager';
import { ContainerModuleManager } from './ContainerModuleManager';
import { PlanResultCacheManager } from './PlanResultCacheManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';

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
      rebindSync: vitest.fn(),
      unbind: vitest.fn(),
      unbindAll: vitest.fn(),
      unbindSync: vitest.fn(),
    } as Partial<Mocked<BindingManager>> as Mocked<BindingManager>;
    deactivationParamsFixture = Symbol() as unknown as DeactivationParams;
    defaultScopeFixture = bindingScopeValues.Singleton;
    planResultCacheManagerMock = {
      invalidateService: vitest.fn(),
    } as Partial<
      Mocked<PlanResultCacheManager>
    > as Mocked<PlanResultCacheManager>;
    serviceReferenceManagerMock = {
      activationService: {} as Partial<
        Mocked<ActivationsService>
      > as Mocked<ActivationsService>,
      bindingService: {} as Partial<
        Mocked<BindingService>
      > as Mocked<BindingService>,
      deactivationService: {} as Partial<
        Mocked<DeactivationsService>
      > as Mocked<DeactivationsService>,
      planResultCacheService: {} as Partial<
        Mocked<PlanResultCacheService>
      > as Mocked<PlanResultCacheService>,
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;
  });

  describe('.load', () => {
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
        ).load(asyncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModule.load', () => {
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
          ) => Promise<BindToFluentSyntax<T>>,
          rebindSync: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          unbind: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => Promise<void>,
          unbindSync: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => void,
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
        ).load(syncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModule.load', () => {
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
          ) => Promise<BindToFluentSyntax<T>>,
          rebindSync: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          unbind: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => Promise<void>,
          unbindSync: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => void,
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

  describe('.loadSync', () => {
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
        ).loadSync(syncContainerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModule.load', () => {
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
          ) => Promise<BindToFluentSyntax<T>>,
          rebindSync: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          unbind: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => Promise<void>,
          unbindSync: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => void,
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
          ).loadSync(asyncContainerModuleMock);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModule.load', () => {
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
          ) => Promise<BindToFluentSyntax<T>>,
          rebindSync: expect.any(Function) as unknown as <T>(
            serviceIdentifier: ServiceIdentifier<T>,
          ) => BindToFluentSyntax<T>,
          unbind: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => Promise<void>,
          unbindSync: expect.any(Function) as unknown as (
            serviceIdentifier: BindingIdentifier | ServiceIdentifier,
          ) => void,
        };

        expect(asyncContainerModuleMock.load).toHaveBeenCalledExactlyOnceWith(
          options,
        );
      });

      it('should throw an InversifyContainerError', () => {
        const expectedErrorProperties: Partial<InversifyContainerError> = {
          kind: InversifyContainerErrorKind.invalidOperation,
          message:
            'Unexpected asynchronous module load. Consider using Container.load() instead.',
        };

        expect(result).toBeInstanceOf(InversifyContainerError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
