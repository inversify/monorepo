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
  AutobindOptions,
  BindingActivation,
  BindingActivationRelation,
  BindingDeactivation,
  BindingDeactivationRelation,
  BindingScope,
  bindingScopeValues,
  BindingService,
  DeactivationParams,
  DeactivationsService,
  GetOptions,
  GetOptionsTagConstraint,
  PlanResultCacheService,
} from '@inversifyjs/core';

vitest.mock('./BindingManager');
vitest.mock('./ContainerModuleManager');
vitest.mock('./DeactivationParamsManager');
vitest.mock('./PlanParamsOperationsManager');
vitest.mock('./PlanResultCacheManager');
vitest.mock('./PluginManager');
vitest.mock('./ServiceReferenceManager');
vitest.mock('./ServiceResolutionManager');
vitest.mock('./SnapshotManager');

import { Plugin, PluginContext } from '@inversifyjs/plugin';

import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { ContainerModule } from '../models/ContainerModule';
import { BindingManager } from './BindingManager';
import { Container } from './Container';
import { ContainerModuleManager } from './ContainerModuleManager';
import { DeactivationParamsManager } from './DeactivationParamsManager';
import { PlanParamsOperationsManager } from './PlanParamsOperationsManager';
import { PlanResultCacheManager } from './PlanResultCacheManager';
import { PluginManager } from './PluginManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';
import { ServiceResolutionManager } from './ServiceResolutionManager';
import { SnapshotManager } from './SnapshotManager';

describe(Container, () => {
  let activationServiceMock: Mocked<ActivationsService>;
  let bindingManagerMock: Mocked<BindingManager>;
  let bindingManagerClassMock: Newable<Mocked<BindingManager>>;
  let bindingServiceMock: Mocked<BindingService>;
  let containerModuleManagerClassMock: Newable<Mocked<ContainerModuleManager>>;
  let containerModuleManagerMock: Mocked<ContainerModuleManager>;
  let deactivationParamsManagerClassMock: Newable<
    Mocked<DeactivationParamsManager>
  >;
  let deactivationParamsManagerMock: Mocked<DeactivationParamsManager>;
  let deactivationServiceMock: Mocked<DeactivationsService>;
  let planParamsOperationsManagerClassMock: Newable<
    Mocked<PlanParamsOperationsManager>
  >;
  let planParamsOperationsManagerMock: Mocked<PlanParamsOperationsManager>;
  let planResultCacheManagerClassMock: Newable<Mocked<PlanResultCacheManager>>;
  let planResultCacheManagerMock: Mocked<PlanResultCacheManager>;
  let planResultCacheServiceClassMock: Newable<Mocked<PlanResultCacheService>>;
  let planResultCacheServiceMock: Mocked<PlanResultCacheService>;
  let pluginManagerClassMock: Newable<Mocked<PluginManager>>;
  let pluginManagerMock: Mocked<PluginManager>;
  let serviceReferenceManagerClassMock: Newable<
    Mocked<ServiceReferenceManager>
  >;
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;
  let serviceResolutionManagerClassMock: Newable<
    Mocked<ServiceResolutionManager>
  >;
  let serviceResolutionManagerMock: Mocked<ServiceResolutionManager>;
  let snapshotManagerClassMock: Newable<Mocked<SnapshotManager>>;
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
    bindingManagerClassMock = class implements Partial<Mocked<BindingManager>> {
      public bind: Mocked<BindingManager>['bind'] = bindingManagerMock.bind;
      public isBound: Mocked<BindingManager>['isBound'] =
        bindingManagerMock.isBound;
      public isCurrentBound: Mocked<BindingManager>['isCurrentBound'] =
        bindingManagerMock.isCurrentBound;
      public rebind: Mocked<BindingManager>['rebind'] =
        bindingManagerMock.rebind;
      public rebindSync: Mocked<BindingManager>['rebindSync'] =
        bindingManagerMock.rebindSync;
      public unbind: Mocked<BindingManager>['unbind'] =
        bindingManagerMock.unbind;
      public unbindAll: Mocked<BindingManager>['unbindAll'] =
        bindingManagerMock.unbindAll;
      public unbindSync: Mocked<BindingManager>['unbindSync'] =
        bindingManagerMock.unbindSync;
    } as Newable<Partial<Mocked<BindingManager>>> as Newable<
      Mocked<BindingManager>
    >;
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
    containerModuleManagerClassMock = class implements Partial<
      Mocked<ContainerModuleManager>
    > {
      public load: Mocked<ContainerModuleManager>['load'] =
        containerModuleManagerMock.load;
      public loadSync: Mocked<ContainerModuleManager>['loadSync'] =
        containerModuleManagerMock.loadSync;
      public unload: Mocked<ContainerModuleManager>['unload'] =
        containerModuleManagerMock.unload;
      public unloadSync: Mocked<ContainerModuleManager>['unloadSync'] =
        containerModuleManagerMock.unloadSync;
    } as Newable<Partial<Mocked<ContainerModuleManager>>> as Newable<
      Mocked<ContainerModuleManager>
    >;
    deactivationParamsManagerMock = {
      deactivationParams: Symbol() as unknown as DeactivationParams,
    } as Partial<
      Mocked<DeactivationParamsManager>
    > as Mocked<DeactivationParamsManager>;
    deactivationParamsManagerClassMock = class implements Partial<
      Mocked<DeactivationParamsManager>
    > {
      public deactivationParams: Mocked<DeactivationParamsManager>['deactivationParams'] =
        deactivationParamsManagerMock.deactivationParams;
    } as Newable<Partial<Mocked<DeactivationParamsManager>>> as Newable<
      Mocked<DeactivationParamsManager>
    >;
    deactivationServiceMock = {
      add: vitest.fn(),
      clone: vitest.fn().mockReturnThis(),
      removeAllByModuleId: vitest.fn(),
      removeAllByServiceId: vitest.fn(),
    } as Partial<Mocked<DeactivationsService>> as Mocked<DeactivationsService>;
    planParamsOperationsManagerMock = {
      planParamsOperations: {
        getBindings: vitest.fn(),
        getBindingsChained: vitest.fn(),
        getClassMetadata: vitest.fn(),
        getPlan: vitest.fn(),
        setBinding: vitest.fn(),
        setNonCachedServiceNode: vitest.fn(),
        setPlan: vitest.fn(),
      },
    } as Partial<
      Mocked<PlanParamsOperationsManager>
    > as Mocked<PlanParamsOperationsManager>;
    planParamsOperationsManagerClassMock = class implements Partial<
      Mocked<PlanParamsOperationsManager>
    > {
      public planParamsOperations: Mocked<PlanParamsOperationsManager>['planParamsOperations'] =
        planParamsOperationsManagerMock.planParamsOperations;
    } as Newable<Partial<Mocked<PlanParamsOperationsManager>>> as Newable<
      Mocked<PlanParamsOperationsManager>
    >;
    planResultCacheManagerMock = {
      invalidateService: vitest.fn(),
    } as Partial<
      Mocked<PlanResultCacheManager>
    > as Mocked<PlanResultCacheManager>;
    planResultCacheManagerClassMock = class implements Partial<
      Mocked<PlanResultCacheManager>
    > {
      public invalidateService: Mocked<PlanResultCacheManager>['invalidateService'] =
        planResultCacheManagerMock.invalidateService;
    } as Newable<Partial<Mocked<PlanResultCacheManager>>> as Newable<
      Mocked<PlanResultCacheManager>
    >;
    planResultCacheServiceMock = {
      get: vitest.fn(),
      set: vitest.fn(),
      subscribe: vitest.fn(),
    } as Partial<
      Mocked<PlanResultCacheService>
    > as Mocked<PlanResultCacheService>;
    planResultCacheServiceClassMock = class implements Partial<
      Mocked<PlanResultCacheService>
    > {
      public get: Mocked<PlanResultCacheService>['get'] =
        planResultCacheServiceMock.get;
      public set: Mocked<PlanResultCacheService>['set'] =
        planResultCacheServiceMock.set;
      public subscribe: Mocked<PlanResultCacheService>['subscribe'] =
        planResultCacheServiceMock.subscribe;
    } as Newable<Partial<Mocked<PlanResultCacheService>>> as Newable<
      Mocked<PlanResultCacheService>
    >;
    pluginManagerMock = {
      register: vitest.fn(),
    } as Partial<Mocked<PluginManager>> as Mocked<PluginManager>;
    pluginManagerClassMock = class implements Partial<Mocked<PluginManager>> {
      public register: Mocked<PluginManager>['register'] =
        pluginManagerMock.register;
    } as Newable<Partial<Mocked<PluginManager>>> as Newable<
      Mocked<PluginManager>
    >;
    serviceReferenceManagerMock = {
      activationService: activationServiceMock,
      bindingService: bindingServiceMock,
      deactivationService: deactivationServiceMock,
      onReset: vitest.fn(),
      planResultCacheService: planResultCacheServiceMock,
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;
    serviceReferenceManagerClassMock = class implements Partial<
      Mocked<ServiceReferenceManager>
    > {
      public activationService: Mocked<ServiceReferenceManager>['activationService'] =
        serviceReferenceManagerMock.activationService;
      public bindingService: Mocked<ServiceReferenceManager>['bindingService'] =
        serviceReferenceManagerMock.bindingService;
      public deactivationService: Mocked<ServiceReferenceManager>['deactivationService'] =
        serviceReferenceManagerMock.deactivationService;
      public onReset: Mocked<ServiceReferenceManager>['onReset'] =
        serviceReferenceManagerMock.onReset;
      public planResultCacheService: Mocked<ServiceReferenceManager>['planResultCacheService'] =
        serviceReferenceManagerMock.planResultCacheService;
    } as Newable<Partial<Mocked<ServiceReferenceManager>>> as Newable<
      Mocked<ServiceReferenceManager>
    >;
    serviceResolutionManagerMock = {
      get: vitest.fn(),
      getAll: vitest.fn(),
      getAllAsync: vitest.fn(),
      getAsync: vitest.fn(),
    } as Partial<
      Mocked<ServiceResolutionManager>
    > as Mocked<ServiceResolutionManager>;
    serviceResolutionManagerClassMock = class implements Partial<
      Mocked<ServiceResolutionManager>
    > {
      public get: Mocked<ServiceResolutionManager>['get'] =
        serviceResolutionManagerMock.get;
      public getAll: Mocked<ServiceResolutionManager>['getAll'] =
        serviceResolutionManagerMock.getAll;
      public getAllAsync: Mocked<ServiceResolutionManager>['getAllAsync'] =
        serviceResolutionManagerMock.getAllAsync;
      public getAsync: Mocked<ServiceResolutionManager>['getAsync'] =
        serviceResolutionManagerMock.getAsync;
    } as Newable<Partial<Mocked<ServiceResolutionManager>>> as Newable<
      Mocked<ServiceResolutionManager>
    >;
    snapshotManagerMock = {
      restore: vitest.fn(),
      snapshot: vitest.fn(),
    } as Partial<Mocked<SnapshotManager>> as Mocked<SnapshotManager>;
    snapshotManagerClassMock = class implements Partial<
      Mocked<SnapshotManager>
    > {
      public restore: Mocked<SnapshotManager>['restore'] =
        snapshotManagerMock.restore;
      public snapshot: Mocked<SnapshotManager>['snapshot'] =
        snapshotManagerMock.snapshot;
    } as Newable<Partial<Mocked<SnapshotManager>>> as Newable<
      Mocked<SnapshotManager>
    >;

    vitest
      .mocked(ActivationsService.build)
      .mockReturnValue(activationServiceMock);

    vitest.mocked(BindingManager).mockImplementation(bindingManagerClassMock);

    vitest.mocked(BindingService.build).mockReturnValue(bindingServiceMock);

    vitest
      .mocked(ContainerModuleManager)
      .mockImplementation(containerModuleManagerClassMock);

    vitest
      .mocked(DeactivationParamsManager)
      .mockImplementation(deactivationParamsManagerClassMock);

    vitest
      .mocked(DeactivationsService.build)
      .mockReturnValue(deactivationServiceMock);

    vitest
      .mocked(PlanParamsOperationsManager)
      .mockImplementation(planParamsOperationsManagerClassMock);

    vitest
      .mocked(PlanResultCacheManager)
      .mockImplementation(planResultCacheManagerClassMock);

    vitest
      .mocked(PlanResultCacheService)
      .mockImplementation(planResultCacheServiceClassMock);

    vitest.mocked(PluginManager).mockImplementation(pluginManagerClassMock);

    vitest
      .mocked(ServiceReferenceManager)
      .mockImplementation(serviceReferenceManagerClassMock);

    vitest
      .mocked(ServiceResolutionManager)
      .mockImplementation(serviceResolutionManagerClassMock);

    vitest.mocked(SnapshotManager).mockImplementation(snapshotManagerClassMock);
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
            expect.any(Function),
          );
          expect(ActivationsService.build).toHaveBeenNthCalledWith(
            2,
            expect.any(Function),
          );
        });

        it('should call BindingService.build', () => {
          expect(BindingService.build).toHaveBeenCalledTimes(2);
          expect(BindingService.build).toHaveBeenNthCalledWith(
            1,
            expect.any(Function),
            undefined,
          );
          expect(BindingService.build).toHaveBeenNthCalledWith(
            2,
            expect.any(Function),
            undefined,
          );
        });

        it('should call DeactivationsService.build()', () => {
          expect(DeactivationsService.build).toHaveBeenCalledTimes(2);
          expect(DeactivationsService.build).toHaveBeenNthCalledWith(
            1,
            expect.any(Function),
          );
          expect(DeactivationsService.build).toHaveBeenNthCalledWith(
            2,
            expect.any(Function),
          );
        });

        it('should call PlanResultCacheService()', () => {
          expect(PlanResultCacheService).toHaveBeenCalledTimes(2);
          expect(PlanResultCacheService).toHaveBeenNthCalledWith(1);
          expect(PlanResultCacheService).toHaveBeenNthCalledWith(2);
        });

        it('should call planResultCacheService.subscribe()', () => {
          expect(
            planResultCacheServiceMock.subscribe,
          ).toHaveBeenCalledExactlyOnceWith(expect.any(PlanResultCacheService));
        });

        it('should call ServiceReferenceManager()', () => {
          expect(ServiceReferenceManager).toHaveBeenCalledTimes(2);
          expect(ServiceReferenceManager).toHaveBeenNthCalledWith(
            1,
            activationServiceMock,
            bindingServiceMock,
            deactivationServiceMock,
            expect.any(PlanResultCacheService),
          );
          expect(ServiceReferenceManager).toHaveBeenNthCalledWith(
            2,
            activationServiceMock,
            bindingServiceMock,
            deactivationServiceMock,
            expect.any(PlanResultCacheService),
          );
        });

        it('should call PlanParamsOperationsManager()', () => {
          expect(PlanParamsOperationsManager).toHaveBeenCalledTimes(2);
          expect(PlanParamsOperationsManager).toHaveBeenNthCalledWith(
            1,
            expect.any(ServiceReferenceManager),
          );
          expect(PlanParamsOperationsManager).toHaveBeenNthCalledWith(
            2,
            expect.any(ServiceReferenceManager),
          );
        });
      });
    });

    describe('having autobind and default scope options', () => {
      let defaultScopeFixture: BindingScope;

      beforeAll(() => {
        defaultScopeFixture = bindingScopeValues.Singleton;
      });

      describe('when called', () => {
        beforeAll(() => {
          new Container({
            autobind: true,
            defaultScope: defaultScopeFixture,
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call new ActivationsService.build()', () => {
          expect(ActivationsService.build).toHaveBeenCalledExactlyOnceWith(
            expect.any(Function),
          );
        });

        it('should call BindingService.build', () => {
          const expectedAutobindOptions: AutobindOptions = {
            scope: defaultScopeFixture,
          };

          expect(BindingService.build).toHaveBeenCalledExactlyOnceWith(
            expect.any(Function),
            expectedAutobindOptions,
          );
        });

        it('should call DeactivationsService.build()', () => {
          expect(DeactivationsService.build).toHaveBeenCalledExactlyOnceWith(
            expect.any(Function),
          );
        });

        it('should call PlanResultCacheService()', () => {
          expect(PlanResultCacheService).toHaveBeenCalledExactlyOnceWith();
        });

        it('should not call planResultCacheService.subscribe()', () => {
          expect(planResultCacheServiceMock.subscribe).not.toHaveBeenCalled();
        });

        it('should call ServiceReferenceManager()', () => {
          expect(ServiceReferenceManager).toHaveBeenCalledExactlyOnceWith(
            activationServiceMock,
            bindingServiceMock,
            deactivationServiceMock,
            expect.any(PlanResultCacheService),
          );
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
        expect(bindingManagerMock.bind).toHaveBeenCalledExactlyOnceWith(
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
        expect(
          serviceResolutionManagerMock.get,
        ).toHaveBeenCalledExactlyOnceWith(
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
        expect(
          serviceResolutionManagerMock.getAll,
        ).toHaveBeenCalledExactlyOnceWith(
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
        expect(
          serviceResolutionManagerMock.getAllAsync,
        ).toHaveBeenCalledExactlyOnceWith(
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
        expect(
          serviceResolutionManagerMock.getAsync,
        ).toHaveBeenCalledExactlyOnceWith(
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
        expect(bindingManagerMock.isBound).toHaveBeenCalledExactlyOnceWith(
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
        expect(
          bindingManagerMock.isCurrentBound,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
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
        expect(containerModuleManagerMock.load).toHaveBeenCalledExactlyOnceWith(
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
        expect(
          containerModuleManagerMock.loadSync,
        ).toHaveBeenCalledExactlyOnceWith(containerModuleMock);
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

        expect(activationServiceMock.add).toHaveBeenCalledExactlyOnceWith(
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

        expect(deactivationServiceMock.add).toHaveBeenCalledExactlyOnceWith(
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
        expect(bindingManagerMock.rebind).toHaveBeenCalledExactlyOnceWith(
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
        expect(bindingManagerMock.rebindSync).toHaveBeenCalledExactlyOnceWith(
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
        expect(pluginManagerMock.register).toHaveBeenCalledExactlyOnceWith(
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
        expect(snapshotManagerMock.restore).toHaveBeenCalledExactlyOnceWith();
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
        expect(snapshotManagerMock.snapshot).toHaveBeenCalledExactlyOnceWith();
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
        expect(bindingManagerMock.unbind).toHaveBeenCalledExactlyOnceWith(
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
        expect(bindingManagerMock.unbindSync).toHaveBeenCalledExactlyOnceWith(
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
        expect(bindingManagerMock.unbindAll).toHaveBeenCalledExactlyOnceWith();
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
        expect(
          containerModuleManagerMock.unload,
        ).toHaveBeenCalledExactlyOnceWith(containerModuleFixture);
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
        expect(
          containerModuleManagerMock.unloadSync,
        ).toHaveBeenCalledExactlyOnceWith(containerModuleFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
