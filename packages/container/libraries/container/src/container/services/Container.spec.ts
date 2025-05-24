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

vitest.mock('@inversifyjs/core');

vitest.mock('../../common/calculations/getFirstIterableResult');

import { Newable, ServiceIdentifier } from '@inversifyjs/common';
import {
  ActivationsService,
  BindingActivation,
  BindingActivationRelation,
  BindingDeactivation,
  BindingDeactivationRelation,
  BindingService,
  DeactivationParams,
  DeactivationsService,
  GetOptions,
  GetOptionsTagConstraint,
  PlanResultCacheService,
} from '@inversifyjs/core';

vitest.mock('../calculations/buildDeactivationParams');
vitest.mock('./BindingManager');
vitest.mock('./ContainerModuleManager');
vitest.mock('./PluginManager');
vitest.mock('./ServiceReferenceManager');
vitest.mock('./ServiceResolutionManager');
vitest.mock('./SnapshotManager');

import { Plugin, PluginContext } from '@inversifyjs/plugin';

import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { buildDeactivationParams } from '../calculations/buildDeactivationParams';
import { ContainerModule } from '../models/ContainerModule';
import { BindingManager } from './BindingManager';
import { Container } from './Container';
import { ContainerModuleManager } from './ContainerModuleManager';
import { PluginManager } from './PluginManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';
import { ServiceResolutionManager } from './ServiceResolutionManager';
import { SnapshotManager } from './SnapshotManager';

describe(Container, () => {
  let activationServiceMock: Mocked<ActivationsService>;
  let bindingManagerMock: Mocked<BindingManager>;
  let bindingServiceMock: Mocked<BindingService>;
  let containerModuleManagerMock: Mocked<ContainerModuleManager>;
  let deactivationParamsFixture: DeactivationParams;
  let deactivationServiceMock: Mocked<DeactivationsService>;
  let planResultCacheServiceMock: Mocked<PlanResultCacheService>;
  let pluginManagerMock: Mocked<PluginManager>;
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;
  let serviceResolutionManagerMock: Mocked<ServiceResolutionManager>;
  let snapshotManagerMock: Mocked<SnapshotManager>;

  beforeAll(() => {
    activationServiceMock = {
      add: vitest.fn(),
      clone: vitest.fn().mockReturnThis(),
      get: vitest.fn(),
      removeAllByModuleId: vitest.fn(),
      removeAllByServiceId: vitest.fn(),
    } as Partial<Mocked<ActivationsService>> as Mocked<ActivationsService>;
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
    bindingServiceMock = {
      clone: vitest.fn().mockReturnThis(),
      get: vitest.fn(),
      removeAllByModuleId: vitest.fn(),
    } as Partial<Mocked<BindingService>> as Mocked<BindingService>;
    containerModuleManagerMock = {
      load: vitest.fn(),
      loadSync: vitest.fn(),
      unload: vitest.fn(),
      unloadSync: vitest.fn(),
    } as Partial<
      Mocked<ContainerModuleManager>
    > as Mocked<ContainerModuleManager>;
    deactivationParamsFixture = Symbol() as unknown as DeactivationParams;
    deactivationServiceMock = {
      add: vitest.fn(),
      clone: vitest.fn().mockReturnThis(),
      removeAllByModuleId: vitest.fn(),
      removeAllByServiceId: vitest.fn(),
    } as Partial<Mocked<DeactivationsService>> as Mocked<DeactivationsService>;
    planResultCacheServiceMock = {
      get: vitest.fn(),
      set: vitest.fn(),
      subscribe: vitest.fn(),
    } as Partial<
      Mocked<PlanResultCacheService>
    > as Mocked<PlanResultCacheService>;
    pluginManagerMock = {
      register: vitest.fn(),
    } as Partial<Mocked<PluginManager>> as Mocked<PluginManager>;
    serviceReferenceManagerMock = {
      activationService: activationServiceMock,
      bindingService: bindingServiceMock,
      deactivationService: deactivationServiceMock,
      planResultCacheService: planResultCacheServiceMock,
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;
    serviceResolutionManagerMock = {
      get: vitest.fn(),
      getAll: vitest.fn(),
      getAllAsync: vitest.fn(),
      getAsync: vitest.fn(),
    } as Partial<
      Mocked<ServiceResolutionManager>
    > as Mocked<ServiceResolutionManager>;
    snapshotManagerMock = {
      restore: vitest.fn(),
      snapshot: vitest.fn(),
    } as Partial<Mocked<SnapshotManager>> as Mocked<SnapshotManager>;

    vitest
      .mocked(buildDeactivationParams)
      .mockReturnValue(deactivationParamsFixture);

    vitest
      .mocked(ActivationsService.build)
      .mockReturnValue(activationServiceMock);

    vitest.mocked(BindingManager).mockReturnValue(bindingManagerMock);

    vitest.mocked(BindingService.build).mockReturnValue(bindingServiceMock);

    vitest
      .mocked(ContainerModuleManager)
      .mockReturnValue(containerModuleManagerMock);

    vitest
      .mocked(DeactivationsService.build)
      .mockReturnValue(deactivationServiceMock);

    vitest
      .mocked(PlanResultCacheService)
      .mockReturnValue(planResultCacheServiceMock);

    vitest.mocked(PluginManager).mockReturnValue(pluginManagerMock);

    vitest
      .mocked(ServiceReferenceManager)
      .mockReturnValue(serviceReferenceManagerMock);

    vitest
      .mocked(ServiceResolutionManager)
      .mockReturnValue(serviceResolutionManagerMock);

    vitest.mocked(SnapshotManager).mockReturnValue(snapshotManagerMock);
  });

  describe('.constructor', () => {
    describe('having a parent container', () => {
      let parentContainerFixture: Container;

      beforeAll(() => {
        parentContainerFixture = new Container();
      });

      describe('when called', () => {
        beforeAll(() => {
          new Container({
            parent: parentContainerFixture,
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call new ActivationsService.build()', () => {
          expect(ActivationsService.build).toHaveBeenCalledTimes(2);
          expect(ActivationsService.build).toHaveBeenNthCalledWith(
            1,
            undefined,
          );
          expect(ActivationsService.build).toHaveBeenNthCalledWith(
            2,
            activationServiceMock,
          );
        });

        it('should call BindingService.build', () => {
          expect(BindingService.build).toHaveBeenCalledTimes(2);
          expect(BindingService.build).toHaveBeenNthCalledWith(1, undefined);
          expect(BindingService.build).toHaveBeenNthCalledWith(
            2,
            bindingServiceMock,
          );
        });

        it('should call DeactivationsService.build()', () => {
          expect(DeactivationsService.build).toHaveBeenCalledTimes(2);
          expect(DeactivationsService.build).toHaveBeenNthCalledWith(
            1,
            undefined,
          );
          expect(DeactivationsService.build).toHaveBeenNthCalledWith(
            2,
            deactivationServiceMock,
          );
        });

        it('should call PlanResultCacheService()', () => {
          expect(PlanResultCacheService).toHaveBeenCalledTimes(2);
          expect(PlanResultCacheService).toHaveBeenNthCalledWith(1);
          expect(PlanResultCacheService).toHaveBeenNthCalledWith(2);
        });

        it('should call planResultCacheService.subscribe()', () => {
          expect(planResultCacheServiceMock.subscribe).toHaveBeenCalledTimes(1);
          expect(planResultCacheServiceMock.subscribe).toHaveBeenCalledWith(
            planResultCacheServiceMock,
          );
        });

        it('should call ServiceReferenceManager()', () => {
          expect(ServiceReferenceManager).toHaveBeenCalledTimes(2);
          expect(ServiceReferenceManager).toHaveBeenNthCalledWith(
            1,
            activationServiceMock,
            bindingServiceMock,
            deactivationServiceMock,
            planResultCacheServiceMock,
          );
          expect(ServiceReferenceManager).toHaveBeenNthCalledWith(
            2,
            activationServiceMock,
            bindingServiceMock,
            deactivationServiceMock,
            planResultCacheServiceMock,
          );
        });
      });
    });
  });

  describe('.dispose', () => {
    describe('having a parent container', () => {
      let parentContainerFixture: Container;
      let parentServiceReferenceManagerMock: Mocked<ServiceReferenceManager>;
      let parentPlanResultCacheServiceMock: Mocked<PlanResultCacheService>;

      beforeAll(() => {
        parentPlanResultCacheServiceMock = {
          subscribe: vitest.fn(),
          unsubscribe: vitest.fn(),
        } as Partial<
          Mocked<PlanResultCacheService>
        > as Mocked<PlanResultCacheService>;
        parentServiceReferenceManagerMock = {
          planResultCacheService: parentPlanResultCacheServiceMock,
        } as Partial<
          Mocked<ServiceReferenceManager>
        > as Mocked<ServiceReferenceManager>;

        vitest
          .mocked(PlanResultCacheService)
          .mockReturnValueOnce(parentPlanResultCacheServiceMock);
        vitest
          .mocked(ServiceReferenceManager)
          .mockReturnValueOnce(parentServiceReferenceManagerMock);

        parentContainerFixture = new Container();
      });

      describe('when called', () => {
        beforeAll(() => {
          const child: Container = new Container({
            parent: parentContainerFixture,
          });

          child.dispose();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call parent planResultCacheService.unsubscribe()', () => {
          expect(
            parentPlanResultCacheServiceMock.unsubscribe,
          ).toHaveBeenCalledTimes(1);
          expect(
            parentPlanResultCacheServiceMock.unsubscribe,
          ).toHaveBeenCalledWith(planResultCacheServiceMock);
        });
      });
    });
  });

  describe('.bind', () => {
    describe('when called', () => {
      let bindToFluentSyntaxFixture: BindToFluentSyntax<unknown>;
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(() => {
        bindToFluentSyntaxFixture =
          Symbol() as unknown as BindToFluentSyntax<unknown>;
        serviceIdentifierFixture = 'service-id';

        bindingManagerMock.bind.mockReturnValueOnce(bindToFluentSyntaxFixture);

        result = new Container().bind(serviceIdentifierFixture);
      });

      it('should call bindingManager.bind()', () => {
        expect(bindingManagerMock.bind).toHaveBeenCalledTimes(1);
        expect(bindingManagerMock.bind).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should return BindToFluentSyntax', () => {
        expect(result).toBe(bindToFluentSyntaxFixture);
      });
    });
  });

  describe('.get', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let getOptionsFixture: GetOptions;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      getOptionsFixture = {
        name: 'name',
        optional: true,
        tag: {
          key: 'tag-key',
          value: Symbol(),
        },
      };
    });

    describe('when called', () => {
      let resolvedValueFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValueFixture = Symbol();

        serviceResolutionManagerMock.get.mockReturnValueOnce(
          resolvedValueFixture,
        );

        result = new Container().get(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceResolutionManager.get()', () => {
        expect(serviceResolutionManagerMock.get).toHaveBeenCalledTimes(1);
        expect(serviceResolutionManagerMock.get).toHaveBeenCalledWith(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });
  });

  describe('.getAll', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let getOptionsFixture: GetOptions;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      getOptionsFixture = {
        name: 'name',
        optional: true,
        tag: {
          key: 'tag-key',
          value: Symbol(),
        },
      };
    });

    describe('when called', () => {
      let resolvedValueFixture: unknown[];

      let result: unknown;

      beforeAll(() => {
        resolvedValueFixture = [Symbol()];

        serviceResolutionManagerMock.getAll.mockReturnValueOnce(
          resolvedValueFixture,
        );

        result = new Container().getAll(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceResolutionManager.getAll()', () => {
        expect(serviceResolutionManagerMock.getAll).toHaveBeenCalledTimes(1);
        expect(serviceResolutionManagerMock.getAll).toHaveBeenCalledWith(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });
  });

  describe('.getAllAsync', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let getOptionsFixture: GetOptions;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      getOptionsFixture = {
        name: 'name',
        optional: true,
        tag: {
          key: 'tag-key',
          value: Symbol(),
        },
      };
    });

    describe('when called', () => {
      let resolvedValueFixture: unknown[];

      let result: unknown;

      beforeAll(async () => {
        resolvedValueFixture = [Symbol()];

        serviceResolutionManagerMock.getAllAsync.mockResolvedValueOnce(
          resolvedValueFixture,
        );

        result = await new Container().getAllAsync(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceResolutionManager.getAllAsync()', () => {
        expect(serviceResolutionManagerMock.getAllAsync).toHaveBeenCalledTimes(
          1,
        );
        expect(serviceResolutionManagerMock.getAllAsync).toHaveBeenCalledWith(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });
  });

  describe('.getAsync', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let getOptionsFixture: GetOptions;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      getOptionsFixture = {
        name: 'name',
        optional: true,
        tag: {
          key: 'tag-key',
          value: Symbol(),
        },
      };
    });

    describe('when called', () => {
      let resolvedValueFixture: unknown;

      let result: unknown;

      beforeAll(async () => {
        resolvedValueFixture = Symbol();

        serviceResolutionManagerMock.getAsync.mockResolvedValueOnce(
          resolvedValueFixture,
        );

        result = await new Container().getAsync(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceResolutionManager.getAsync()', () => {
        expect(serviceResolutionManagerMock.getAsync).toHaveBeenCalledTimes(1);
        expect(serviceResolutionManagerMock.getAsync).toHaveBeenCalledWith(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });
  });

  describe('.isBound', () => {
    let serviceIdentifierFixture: ServiceIdentifier;

    let nameFixture: string;
    let tagFixture: GetOptionsTagConstraint;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';

      nameFixture = 'name-fixture';
      tagFixture = {
        key: 'tag-key-fixture',
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let isBoundResult: boolean;
      let result: unknown;

      beforeAll(() => {
        isBoundResult = false;

        bindingManagerMock.isBound.mockReturnValueOnce(isBoundResult);

        result = new Container().isBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.isBound()', () => {
        expect(bindingManagerMock.isBound).toHaveBeenCalledTimes(1);
        expect(bindingManagerMock.isBound).toHaveBeenCalledWith(
          serviceIdentifierFixture,
          {
            name: nameFixture,
            tag: tagFixture,
          },
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(isBoundResult);
      });
    });
  });

  describe('.isCurrentBound', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let nameFixture: string;
    let tagFixture: GetOptionsTagConstraint;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      nameFixture = 'name-fixture';
      tagFixture = {
        key: 'tag-key-fixture',
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let isBoundResult: boolean;
      let result: unknown;

      beforeAll(() => {
        isBoundResult = false;

        bindingManagerMock.isCurrentBound.mockReturnValueOnce(isBoundResult);

        result = new Container().isCurrentBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.isCurrentBound()', () => {
        expect(bindingManagerMock.isCurrentBound).toHaveBeenCalledTimes(1);
        expect(bindingManagerMock.isCurrentBound).toHaveBeenCalledWith(
          serviceIdentifierFixture,
          {
            name: nameFixture,
            tag: tagFixture,
          },
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(isBoundResult);
      });
    });
  });

  describe('.load', () => {
    let containerModuleMock: Mocked<ContainerModule>;

    beforeAll(() => {
      containerModuleMock = {
        load: vitest.fn().mockReturnValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await new Container().load(containerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModuleManager.load', () => {
        expect(containerModuleManagerMock.load).toHaveBeenCalledTimes(1);
        expect(containerModuleManagerMock.load).toHaveBeenCalledWith(
          containerModuleMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.loadSync', () => {
    let containerModuleMock: Mocked<ContainerModule>;

    beforeAll(() => {
      containerModuleMock = {
        load: vitest.fn().mockReturnValue(undefined),
      } as Partial<Mocked<ContainerModule>> as Mocked<ContainerModule>;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = new Container().loadSync(containerModuleMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModuleManager.loadSync', () => {
        expect(containerModuleManagerMock.loadSync).toHaveBeenCalledTimes(1);
        expect(containerModuleManagerMock.loadSync).toHaveBeenCalledWith(
          containerModuleMock,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.onActivation', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let activationMock: Mock<BindingActivation>;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      activationMock = vitest.fn();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = new Container().onActivation(
          serviceIdentifierFixture,
          activationMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationService.add()', () => {
        const bindingActivationRelation: BindingActivationRelation = {
          serviceId: serviceIdentifierFixture,
        };

        expect(activationServiceMock.add).toHaveBeenCalledTimes(1);
        expect(activationServiceMock.add).toHaveBeenCalledWith(
          activationMock,
          bindingActivationRelation,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.onDeactivation', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let deactivationMock: Mock<BindingDeactivation>;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      deactivationMock = vitest.fn();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = new Container().onDeactivation(
          serviceIdentifierFixture,
          deactivationMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call deactivationService.add()', () => {
        const bindingDeactivationRelation: BindingDeactivationRelation = {
          serviceId: serviceIdentifierFixture,
        };

        expect(deactivationServiceMock.add).toHaveBeenCalledTimes(1);
        expect(deactivationServiceMock.add).toHaveBeenCalledWith(
          deactivationMock,
          bindingDeactivationRelation,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.rebind', () => {
    describe('when called', () => {
      let bindToFluentSyntaxFixture: BindToFluentSyntax<unknown>;
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(async () => {
        bindToFluentSyntaxFixture =
          Symbol() as unknown as BindToFluentSyntax<unknown>;
        serviceIdentifierFixture = 'service-id';

        vitest
          .mocked(bindingManagerMock.rebind)
          .mockResolvedValueOnce(bindToFluentSyntaxFixture);

        result = await new Container().rebind(serviceIdentifierFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingManager.rebind()', () => {
        expect(bindingManagerMock.rebind).toHaveBeenCalledTimes(1);
        expect(bindingManagerMock.rebind).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should return BindToFluentSyntax', () => {
        expect(result).toBe(bindToFluentSyntaxFixture);
      });
    });
  });

  describe('.rebindSync', () => {
    describe('when called', () => {
      let bindToFluentSyntaxFixture: BindToFluentSyntax<unknown>;
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(() => {
        bindToFluentSyntaxFixture =
          Symbol() as unknown as BindToFluentSyntax<unknown>;
        serviceIdentifierFixture = 'service-id';

        vitest
          .mocked(bindingManagerMock.rebindSync)
          .mockReturnValueOnce(bindToFluentSyntaxFixture);

        result = new Container().rebindSync(serviceIdentifierFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingManager.rebindSync()', () => {
        expect(bindingManagerMock.rebindSync).toHaveBeenCalledTimes(1);
        expect(bindingManagerMock.rebindSync).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should return BindToFluentSyntax', () => {
        expect(result).toStrictEqual(bindToFluentSyntaxFixture);
      });
    });
  });

  describe('.register', () => {
    let pluginConstructorFixture: Newable<
      Plugin<Container>,
      [Container, PluginContext]
    >;

    beforeAll(() => {
      pluginConstructorFixture = Symbol() as unknown as Newable<
        Plugin<Container>,
        [Container, PluginContext]
      >;
    });

    describe('when called', () => {
      let container: Container;
      let result: unknown;

      beforeAll(() => {
        container = new Container();
        result = container.register(pluginConstructorFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call pluginManager.register()', () => {
        expect(pluginManagerMock.register).toHaveBeenCalledTimes(1);
        expect(pluginManagerMock.register).toHaveBeenCalledWith(
          container,
          pluginConstructorFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.restore', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        new Container().restore();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call snapshotManager.restore()', () => {
        expect(snapshotManagerMock.restore).toHaveBeenCalledTimes(1);
        expect(snapshotManagerMock.restore).toHaveBeenCalledWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.snapshot', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        new Container().snapshot();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call snapshotManager.snapshot()', () => {
        expect(snapshotManagerMock.snapshot).toHaveBeenCalledTimes(1);
        expect(snapshotManagerMock.snapshot).toHaveBeenCalledWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.unbind', () => {
    let serviceIdentifierFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdentifierFixture = 'serviceId';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        bindingManagerMock.unbind.mockResolvedValueOnce(undefined);

        result = await new Container().unbind(serviceIdentifierFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingManager.unbind()', () => {
        expect(bindingManagerMock.unbind).toHaveBeenCalledTimes(1);
        expect(bindingManagerMock.unbind).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('unbindSync', () => {
    let serviceIdentifierFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdentifierFixture = 'serviceId';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        bindingManagerMock.unbindSync.mockReturnValueOnce(undefined);

        result = new Container().unbindSync(serviceIdentifierFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingManager.unbindSync()', () => {
        expect(bindingManagerMock.unbindSync).toHaveBeenCalledTimes(1);
        expect(bindingManagerMock.unbindSync).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.unbindAll', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        bindingManagerMock.unbindAll.mockResolvedValueOnce(undefined);

        result = await new Container().unbindAll();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingManager.unbindAll()', () => {
        expect(bindingManagerMock.unbindAll).toHaveBeenCalledTimes(1);
        expect(bindingManagerMock.unbindAll).toHaveBeenCalledWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.unload', () => {
    let containerModuleFixture: ContainerModule;

    beforeAll(() => {
      containerModuleFixture = {
        id: 2,
      } as Partial<ContainerModule> as ContainerModule;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await new Container().unload(containerModuleFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModuleManager.unload()', () => {
        expect(containerModuleManagerMock.unload).toHaveBeenCalledTimes(1);
        expect(containerModuleManagerMock.unload).toHaveBeenCalledWith(
          containerModuleFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.unloadSync', () => {
    let containerModuleFixture: ContainerModule;

    beforeAll(() => {
      containerModuleFixture = {
        id: 2,
      } as Partial<ContainerModule> as ContainerModule;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = new Container().unloadSync(containerModuleFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call containerModuleManager.unloadSync()', () => {
        expect(containerModuleManagerMock.unloadSync).toHaveBeenCalledTimes(1);
        expect(containerModuleManagerMock.unloadSync).toHaveBeenCalledWith(
          containerModuleFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
