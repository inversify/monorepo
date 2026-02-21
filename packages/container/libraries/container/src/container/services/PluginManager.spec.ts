import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { type Newable } from '@inversifyjs/common';
import {
  type ActivationsService,
  type BindingService,
  type DeactivationsService,
  type PlanResultCacheService,
} from '@inversifyjs/core';
import {
  isPlugin,
  type Plugin,
  type PluginApi,
  type PluginContext,
} from '@inversifyjs/plugin';

import { InversifyContainerError } from '../../error/models/InversifyContainerError.js';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind.js';
import type { Container } from './Container.js';
import { PluginManager } from './PluginManager.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';
import { type ServiceResolutionManager } from './ServiceResolutionManager.js';

describe(PluginManager, () => {
  let containerFixture: Container;
  let serviceReferenceManagerFixture: ServiceReferenceManager;
  let serviceResolutionManagerMock: Mocked<ServiceResolutionManager>;

  beforeAll(() => {
    containerFixture = Symbol() as unknown as Container;
    serviceReferenceManagerFixture = {
      activationService: {} as Partial<ActivationsService>,
      bindingService: {} as Partial<BindingService>,
      deactivationService: {} as Partial<DeactivationsService>,
      planResultCacheService: {} as Partial<PlanResultCacheService>,
    } as Partial<ServiceReferenceManager> as ServiceReferenceManager;
    serviceResolutionManagerMock = {
      onPlan: vitest.fn(),
    } as Partial<
      Mocked<ServiceResolutionManager>
    > as Mocked<ServiceResolutionManager>;
  });

  describe('.register', () => {
    describe('having a non plugin newable type', () => {
      let pluginType: Newable<Plugin<Container>, [Container, PluginContext]>;

      beforeAll(() => {
        pluginType = vitest.fn();
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            new PluginManager(
              containerFixture,
              serviceReferenceManagerFixture,
              serviceResolutionManagerMock,
            ).register(containerFixture, pluginType);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call pluginType', () => {
          const expected: PluginContext = {
            activationService: expect.any(Object) as unknown,
            bindingService: expect.any(Object) as unknown,
            deactivationService: expect.any(Object) as unknown,
            planResultCacheService: expect.any(Object) as unknown,
          } as Partial<PluginContext> as PluginContext;

          expect(pluginType).toHaveBeenCalledExactlyOnceWith(
            containerFixture,
            expected,
          );
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message: 'Invalid plugin. The plugin must extend the Plugin class',
          };

          expect(result).toBeInstanceOf(InversifyContainerError);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    });

    describe('having a plugin newable type', () => {
      let pluginClassMock: Newable<Mocked<Plugin<Container>>>;
      let pluginMock: Mocked<Plugin<Container>>;

      let pluginType: Newable<Plugin<Container>, [Container, PluginContext]>;

      beforeAll(() => {
        pluginMock = {
          [isPlugin]: true,
          load: vitest.fn(),
        } as Partial<Mocked<Plugin<Container>>> as Mocked<Plugin<Container>>;
        pluginClassMock = class implements Partial<Mocked<Plugin<Container>>> {
          public [isPlugin]: true = true as const;
          public load: Mocked<Plugin<Container>>['load'] = pluginMock.load;
        } as Newable<Mocked<Plugin<Container>>>;

        pluginType = vitest
          .fn<Newable<Mocked<Plugin<Container>>>>()
          .mockImplementation(pluginClassMock);
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            new PluginManager(
              containerFixture,
              serviceReferenceManagerFixture,
              serviceResolutionManagerMock,
            ).register(containerFixture, pluginType);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call pluginType', () => {
          const expected: PluginContext = {
            activationService: expect.any(Object) as unknown,
            bindingService: expect.any(Object) as unknown,
            deactivationService: expect.any(Object) as unknown,
            planResultCacheService: expect.any(Object) as unknown,
          } as Partial<PluginContext> as PluginContext;

          expect(pluginType).toHaveBeenCalledExactlyOnceWith(
            containerFixture,
            expected,
          );
        });

        it('should call load method of the plugin instance', () => {
          const expected: PluginApi = {
            define: expect.any(Function) as unknown,
            onPlan: expect.any(Function) as unknown,
          } as Partial<PluginApi> as PluginApi;

          expect(pluginMock.load).toHaveBeenCalledExactlyOnceWith(expected);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
