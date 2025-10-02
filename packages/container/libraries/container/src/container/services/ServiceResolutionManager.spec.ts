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

import { ServiceIdentifier } from '@inversifyjs/common';
import {
  ActivationsService,
  BindingActivation,
  BindingScope,
  bindingScopeValues,
  BindingService,
  DeactivationsService,
  GetAllOptions,
  GetOptions,
  GetOptionsTagConstraint,
  GetPlanOptions,
  plan,
  PlanParams,
  PlanParamsOperations,
  PlanResult,
  PlanResultCacheService,
  ResolutionContext,
  ResolutionParams,
  resolve,
} from '@inversifyjs/core';

import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import { PlanParamsOperationsManager } from './PlanParamsOperationsManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';
import { ServiceResolutionManager } from './ServiceResolutionManager';

describe(ServiceResolutionManager, () => {
  let autobindFixture: boolean;
  let defaultScopeFixture: BindingScope;
  let planParamsOperationsManagerFixture: PlanParamsOperationsManager;
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;

  beforeAll(() => {
    autobindFixture = false;
    defaultScopeFixture = bindingScopeValues.Singleton;
    planParamsOperationsManagerFixture = {
      planParamsOperations: Symbol() as unknown as PlanParamsOperations,
    } as Partial<PlanParamsOperationsManager> as PlanParamsOperationsManager;
    serviceReferenceManagerMock = {
      activationService: {} as Partial<
        Mocked<ActivationsService>
      > as Mocked<ActivationsService>,
      bindingService: {
        get: vitest.fn(),
        getChained: vitest.fn(),
      } as Partial<Mocked<BindingService>> as Mocked<BindingService>,
      deactivationService: {} as Partial<
        Mocked<DeactivationsService>
      > as Mocked<DeactivationsService>,
      onReset: vitest.fn(),
      planResultCacheService: {
        get: vitest.fn(),
        set: vitest.fn(),
        setNonCachedServiceNode: vitest.fn(),
      } as Partial<
        Mocked<PlanResultCacheService>
      > as Mocked<PlanResultCacheService>,
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;
  });

  describe('.get', () => {
    describe('having a serviceResolutionManager with options with no autobind', () => {
      let serviceResolutionManager: ServiceResolutionManager;

      beforeAll(() => {
        serviceResolutionManager = new ServiceResolutionManager(
          planParamsOperationsManagerFixture,
          serviceReferenceManagerMock,
          autobindFixture,
          defaultScopeFixture,
        );
      });

      describe('when called', () => {
        let serviceIdentifierFixture: ServiceIdentifier;
        let getOptionsFixture: GetOptions;

        let planResultFixture: PlanResult;

        let resolvedValueFixture: unknown;

        let result: unknown;

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

          planResultFixture = Symbol() as unknown as PlanResult;

          resolvedValueFixture = Symbol();

          vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

          vitest.mocked(resolve).mockReturnValueOnce(resolvedValueFixture);

          result = serviceResolutionManager.get(
            serviceIdentifierFixture,
            getOptionsFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call serviceReferenceManager.planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional ?? false,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(
            serviceReferenceManagerMock.planResultCacheService.get,
          ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: undefined,
            operations: planParamsOperationsManagerFixture.planParamsOperations,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
          };

          expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
        });

        it('should call resolve()', () => {
          const expectedResolveParams: ResolutionParams = {
            context: {
              get: expect.any(Function),
              getAll: expect.any(Function),
              getAllAsync: expect.any(Function),
              getAsync: expect.any(Function),
            } as unknown as ResolutionContext,
            getActivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingActivation<TActivated>> | undefined,
            planResult: planResultFixture,
            requestScopeCache: new Map(),
          };

          expect(resolve).toHaveBeenCalledExactlyOnceWith(
            expectedResolveParams,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolvedValueFixture);
        });
      });

      describe('when called, and resolve returns Promise', () => {
        let serviceIdentifierFixture: ServiceIdentifier;
        let getOptionsFixture: GetOptions;

        let planResultFixture: PlanResult;

        let resolvedValueFixture: unknown;

        let result: unknown;

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

          planResultFixture = Symbol() as unknown as PlanResult;

          resolvedValueFixture = Symbol();

          vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

          vitest.mocked(resolve).mockResolvedValueOnce(resolvedValueFixture);

          try {
            serviceResolutionManager.get(
              serviceIdentifierFixture,
              getOptionsFixture,
            );
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call serviceReferenceManager.planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional ?? false,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(
            serviceReferenceManagerMock.planResultCacheService.get,
          ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: undefined,
            operations: planParamsOperationsManagerFixture.planParamsOperations,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
          };

          expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
        });

        it('should call resolve()', () => {
          const expectedResolveParams: ResolutionParams = {
            context: {
              get: expect.any(Function),
              getAll: expect.any(Function),
              getAllAsync: expect.any(Function),
              getAsync: expect.any(Function),
            } as unknown as ResolutionContext,
            getActivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingActivation<TActivated>> | undefined,
            planResult: planResultFixture,
            requestScopeCache: new Map(),
          };

          expect(resolve).toHaveBeenCalledExactlyOnceWith(
            expectedResolveParams,
          );
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message: `Unexpected asynchronous service when resolving service "${serviceIdentifierFixture as string}"`,
          };

          expect(result).toBeInstanceOf(InversifyContainerError);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });

      describe('when called onPlan(), and called', () => {
        let serviceIdentifierFixture: ServiceIdentifier;
        let getOptionsFixture: GetOptions;
        let onPlanHandlerMock: Mock<
          (options: GetPlanOptions, result: PlanResult) => void
        >;
        let planResultFixture: PlanResult;

        let resolvedValueFixture: unknown;

        let result: unknown;

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
          onPlanHandlerMock = vitest.fn();
          planResultFixture = Symbol() as unknown as PlanResult;

          resolvedValueFixture = Symbol();

          vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

          vitest.mocked(resolve).mockReturnValueOnce(resolvedValueFixture);

          serviceResolutionManager.onPlan(onPlanHandlerMock);

          result = serviceResolutionManager.get(
            serviceIdentifierFixture,
            getOptionsFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call serviceReferenceManager.planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional ?? false,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(
            serviceReferenceManagerMock.planResultCacheService.get,
          ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: undefined,
            operations: planParamsOperationsManagerFixture.planParamsOperations,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
          };

          expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
        });

        it('should call onPlanHandler()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional ?? false,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(onPlanHandlerMock).toHaveBeenCalledExactlyOnceWith(
            expectedGetPlanOptions,
            planResultFixture,
          );
        });

        it('should call resolve()', () => {
          const expectedResolveParams: ResolutionParams = {
            context: {
              get: expect.any(Function),
              getAll: expect.any(Function),
              getAllAsync: expect.any(Function),
              getAsync: expect.any(Function),
            } as unknown as ResolutionContext,
            getActivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingActivation<TActivated>> | undefined,
            planResult: planResultFixture,
            requestScopeCache: new Map(),
          };

          expect(resolve).toHaveBeenCalledExactlyOnceWith(
            expectedResolveParams,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolvedValueFixture);
        });
      });
    });

    describe('having a serviceResolutionManager with autobind true and default scope', () => {
      let defaultScopeFixture: BindingScope;
      let serviceResolutionManager: ServiceResolutionManager;

      beforeAll(() => {
        defaultScopeFixture = bindingScopeValues.Singleton;
        serviceResolutionManager = new ServiceResolutionManager(
          planParamsOperationsManagerFixture,
          serviceReferenceManagerMock,
          true,
          defaultScopeFixture,
        );
      });

      describe('when called', () => {
        let serviceIdentifierFixture: ServiceIdentifier;
        let getOptionsFixture: GetOptions;

        let planResultFixture: PlanResult;

        let resolvedValueFixture: unknown;

        let result: unknown;

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

          planResultFixture = Symbol() as unknown as PlanResult;

          resolvedValueFixture = Symbol();

          vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

          vitest.mocked(resolve).mockReturnValueOnce(resolvedValueFixture);

          result = serviceResolutionManager.get(
            serviceIdentifierFixture,
            getOptionsFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call serviceReferenceManager.planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional ?? false,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(
            serviceReferenceManagerMock.planResultCacheService.get,
          ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: {
              scope: defaultScopeFixture,
            },
            operations: planParamsOperationsManagerFixture.planParamsOperations,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
          };

          expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
        });

        it('should call resolve()', () => {
          const expectedResolveParams: ResolutionParams = {
            context: {
              get: expect.any(Function),
              getAll: expect.any(Function),
              getAllAsync: expect.any(Function),
              getAsync: expect.any(Function),
            } as unknown as ResolutionContext,
            getActivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingActivation<TActivated>> | undefined,
            planResult: planResultFixture,
            requestScopeCache: new Map(),
          };

          expect(resolve).toHaveBeenCalledExactlyOnceWith(
            expectedResolveParams,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolvedValueFixture);
        });
      });
    });

    describe('having a serviceResolutionManager with options with autobind false and GetOptions with scope', () => {
      let defaultScopeFixture: BindingScope;
      let serviceResolutionManager: ServiceResolutionManager;

      beforeAll(() => {
        defaultScopeFixture = bindingScopeValues.Singleton;
        serviceResolutionManager = new ServiceResolutionManager(
          planParamsOperationsManagerFixture,
          serviceReferenceManagerMock,
          false,
          defaultScopeFixture,
        );
      });

      describe('when called', () => {
        let serviceIdentifierFixture: ServiceIdentifier;
        let getOptionsFixture: GetOptions;

        let planResultFixture: PlanResult;

        let resolvedValueFixture: unknown;

        let result: unknown;

        beforeAll(() => {
          serviceIdentifierFixture = 'service-id';
          getOptionsFixture = {
            autobind: true,
            name: 'name',
            optional: true,
            tag: {
              key: 'tag-key',
              value: Symbol(),
            },
          };

          planResultFixture = Symbol() as unknown as PlanResult;

          resolvedValueFixture = Symbol();

          vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

          vitest.mocked(resolve).mockReturnValueOnce(resolvedValueFixture);

          result = serviceResolutionManager.get(
            serviceIdentifierFixture,
            getOptionsFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call serviceReferenceManager.planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional ?? false,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(
            serviceReferenceManagerMock.planResultCacheService.get,
          ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: {
              scope: defaultScopeFixture,
            },
            operations: planParamsOperationsManagerFixture.planParamsOperations,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
          };

          expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
        });

        it('should call resolve()', () => {
          const expectedResolveParams: ResolutionParams = {
            context: {
              get: expect.any(Function),
              getAll: expect.any(Function),
              getAllAsync: expect.any(Function),
              getAsync: expect.any(Function),
            } as unknown as ResolutionContext,
            getActivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingActivation<TActivated>> | undefined,
            planResult: planResultFixture,
            requestScopeCache: new Map(),
          };

          expect(resolve).toHaveBeenCalledExactlyOnceWith(
            expectedResolveParams,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolvedValueFixture);
        });
      });
    });

    describe('when called, and serviceReferenceManager.planResultCacheService.get() returns PlanResult', () => {
      let defaultScopeFixture: BindingScope;
      let serviceResolutionManager: ServiceResolutionManager;

      let serviceIdentifierFixture: ServiceIdentifier;
      let getOptionsFixture: GetOptions;

      let planResultFixture: PlanResult;

      let resolvedValueFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        defaultScopeFixture = bindingScopeValues.Singleton;
        serviceResolutionManager = new ServiceResolutionManager(
          planParamsOperationsManagerFixture,
          serviceReferenceManagerMock,
          false,
          defaultScopeFixture,
        );

        serviceIdentifierFixture = 'service-id';
        getOptionsFixture = {
          name: 'name',
          optional: true,
          tag: {
            key: 'tag-key',
            value: Symbol(),
          },
        };

        planResultFixture = Symbol() as unknown as PlanResult;

        resolvedValueFixture = Symbol();

        vitest
          .mocked(serviceReferenceManagerMock.planResultCacheService.get)
          .mockReturnValueOnce(planResultFixture);

        vitest.mocked(resolve).mockReturnValueOnce(resolvedValueFixture);

        result = serviceResolutionManager.get(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceReferenceManager.planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: false,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional ?? false,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(
          serviceReferenceManagerMock.planResultCacheService.get,
        ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
      });

      it('should not call plan()', () => {
        expect(plan).not.toHaveBeenCalled();
      });

      it('should call resolve()', () => {
        const expectedResolveParams: ResolutionParams = {
          context: {
            get: expect.any(Function),
            getAll: expect.any(Function),
            getAllAsync: expect.any(Function),
            getAsync: expect.any(Function),
          } as unknown as ResolutionContext,
          getActivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingActivation<TActivated>> | undefined,
          planResult: planResultFixture,
          requestScopeCache: new Map(),
        };

        expect(resolve).toHaveBeenCalledExactlyOnceWith(expectedResolveParams);
      });

      it('should return expected value', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });
  });

  describe('.getAll', () => {
    describe('having options with chained', () => {
      let getAllOptionsFixture: GetAllOptions;

      beforeAll(() => {
        getAllOptionsFixture = {
          chained: true,
        };
      });

      describe('when called', () => {
        let serviceIdentifierFixture: ServiceIdentifier;
        let planResultFixture: PlanResult;
        let resolvedValueFixture: unknown;

        let result: unknown;

        beforeAll(() => {
          serviceIdentifierFixture = 'service-id';
          planResultFixture = Symbol() as unknown as PlanResult;
          resolvedValueFixture = Symbol();

          vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

          vitest.mocked(resolve).mockReturnValueOnce([resolvedValueFixture]);

          result = new ServiceResolutionManager(
            planParamsOperationsManagerFixture,
            serviceReferenceManagerMock,
            autobindFixture,
            defaultScopeFixture,
          ).getAll(serviceIdentifierFixture, getAllOptionsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call serviceReferenceManager.planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            chained: true,
            isMultiple: true,
            name: getAllOptionsFixture.name,
            optional: getAllOptionsFixture.optional ?? false,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getAllOptionsFixture.tag,
          };

          expect(
            serviceReferenceManagerMock.planResultCacheService.get,
          ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: undefined,
            operations: planParamsOperationsManagerFixture.planParamsOperations,
            rootConstraints: {
              chained: true,
              isMultiple: true,
              serviceIdentifier: serviceIdentifierFixture,
            },
            servicesBranch: [],
          };

          expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
        });

        it('should call resolve()', () => {
          const expectedResolveParams: ResolutionParams = {
            context: {
              get: expect.any(Function),
              getAll: expect.any(Function),
              getAllAsync: expect.any(Function),
              getAsync: expect.any(Function),
            } as unknown as ResolutionContext,
            getActivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingActivation<TActivated>> | undefined,
            planResult: planResultFixture,
            requestScopeCache: new Map(),
          };

          expect(resolve).toHaveBeenCalledExactlyOnceWith(
            expectedResolveParams,
          );
        });

        it('should return expected value', () => {
          expect(result).toStrictEqual([resolvedValueFixture]);
        });
      });
    });

    describe('when called', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let getOptionsFixture: GetOptions;

      let planResultFixture: PlanResult;

      let resolvedValueFixture: unknown;

      let result: unknown;

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

        planResultFixture = Symbol() as unknown as PlanResult;

        resolvedValueFixture = Symbol();

        vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

        vitest.mocked(resolve).mockReturnValueOnce([resolvedValueFixture]);

        result = new ServiceResolutionManager(
          planParamsOperationsManagerFixture,
          serviceReferenceManagerMock,
          autobindFixture,
          defaultScopeFixture,
        ).getAll(serviceIdentifierFixture, getOptionsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceReferenceManager.planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          chained: false,
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional ?? false,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(
          serviceReferenceManagerMock.planResultCacheService.get,
        ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
      });

      it('should call plan()', () => {
        const expectedPlanParams: PlanParams = {
          autobindOptions: undefined,
          operations: planParamsOperationsManagerFixture.planParamsOperations,
          rootConstraints: {
            chained: false,
            isMultiple: true,
            isOptional: getOptionsFixture.optional as true,
            name: getOptionsFixture.name as string,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag as GetOptionsTagConstraint,
          },
          servicesBranch: [],
        };

        expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
      });

      it('should call resolve()', () => {
        const expectedResolveParams: ResolutionParams = {
          context: {
            get: expect.any(Function),
            getAll: expect.any(Function),
            getAllAsync: expect.any(Function),
            getAsync: expect.any(Function),
          } as unknown as ResolutionContext,
          getActivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingActivation<TActivated>> | undefined,
          planResult: planResultFixture,
          requestScopeCache: new Map(),
        };

        expect(resolve).toHaveBeenCalledExactlyOnceWith(expectedResolveParams);
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual([resolvedValueFixture]);
      });
    });

    describe('when called, and resolve returns Promise', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let getOptionsFixture: GetOptions;

      let planResultFixture: PlanResult;

      let resolvedValueFixture: unknown;

      let result: unknown;

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

        planResultFixture = Symbol() as unknown as PlanResult;

        resolvedValueFixture = Symbol();

        vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

        vitest.mocked(resolve).mockResolvedValueOnce([resolvedValueFixture]);

        try {
          new ServiceResolutionManager(
            planParamsOperationsManagerFixture,
            serviceReferenceManagerMock,
            autobindFixture,
            defaultScopeFixture,
          ).getAll(serviceIdentifierFixture, getOptionsFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceReferenceManager.planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          chained: false,
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional ?? false,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(
          serviceReferenceManagerMock.planResultCacheService.get,
        ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
      });

      it('should call plan()', () => {
        const expectedPlanParams: PlanParams = {
          autobindOptions: undefined,
          operations: planParamsOperationsManagerFixture.planParamsOperations,
          rootConstraints: {
            chained: false,
            isMultiple: true,
            isOptional: getOptionsFixture.optional as true,
            name: getOptionsFixture.name as string,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag as GetOptionsTagConstraint,
          },
          servicesBranch: [],
        };

        expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
      });

      it('should call resolve()', () => {
        const expectedResolveParams: ResolutionParams = {
          context: {
            get: expect.any(Function),
            getAll: expect.any(Function),
            getAllAsync: expect.any(Function),
            getAsync: expect.any(Function),
          } as unknown as ResolutionContext,
          getActivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingActivation<TActivated>> | undefined,
          planResult: planResultFixture,
          requestScopeCache: new Map(),
        };

        expect(resolve).toHaveBeenCalledExactlyOnceWith(expectedResolveParams);
      });

      it('should throw an InversifyContainerError', () => {
        const expectedErrorProperties: Partial<InversifyContainerError> = {
          kind: InversifyContainerErrorKind.invalidOperation,
          message: `Unexpected asynchronous service when resolving service "${serviceIdentifierFixture as string}"`,
        };

        expect(result).toBeInstanceOf(InversifyContainerError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('.getAllAsync', () => {
    describe('when called', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let getOptionsFixture: GetOptions;

      let planResultFixture: PlanResult;

      let resolvedValueFixture: unknown;

      let result: unknown;

      beforeAll(async () => {
        serviceIdentifierFixture = 'service-id';
        getOptionsFixture = {
          name: 'name',
          optional: true,
          tag: {
            key: 'tag-key',
            value: Symbol(),
          },
        };

        planResultFixture = Symbol() as unknown as PlanResult;

        resolvedValueFixture = Symbol();

        vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

        vitest.mocked(resolve).mockReturnValueOnce([resolvedValueFixture]);

        result = await new ServiceResolutionManager(
          planParamsOperationsManagerFixture,
          serviceReferenceManagerMock,
          autobindFixture,
          defaultScopeFixture,
        ).getAllAsync(serviceIdentifierFixture, getOptionsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceReferenceManager.planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          chained: false,
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional ?? false,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(
          serviceReferenceManagerMock.planResultCacheService.get,
        ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
      });

      it('should call plan()', () => {
        const expectedPlanParams: PlanParams = {
          autobindOptions: undefined,
          operations: planParamsOperationsManagerFixture.planParamsOperations,
          rootConstraints: {
            chained: false,
            isMultiple: true,
            isOptional: getOptionsFixture.optional as true,
            name: getOptionsFixture.name as string,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag as GetOptionsTagConstraint,
          },
          servicesBranch: [],
        };

        expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
      });

      it('should call resolve()', () => {
        const expectedResolveParams: ResolutionParams = {
          context: {
            get: expect.any(Function),
            getAll: expect.any(Function),
            getAllAsync: expect.any(Function),
            getAsync: expect.any(Function),
          } as unknown as ResolutionContext,
          getActivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingActivation<TActivated>> | undefined,
          planResult: planResultFixture,
          requestScopeCache: new Map(),
        };

        expect(resolve).toHaveBeenCalledExactlyOnceWith(expectedResolveParams);
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual([resolvedValueFixture]);
      });
    });
  });

  describe('.getAsync', () => {
    describe('when called', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let getOptionsFixture: GetOptions;

      let planResultFixture: PlanResult;

      let resolvedValueFixture: unknown;

      let result: unknown;

      beforeAll(async () => {
        serviceIdentifierFixture = 'service-id';
        getOptionsFixture = {
          name: 'name',
          optional: true,
          tag: {
            key: 'tag-key',
            value: Symbol(),
          },
        };

        planResultFixture = Symbol() as unknown as PlanResult;

        resolvedValueFixture = Symbol();

        vitest.mocked(plan).mockReturnValueOnce(planResultFixture);

        vitest.mocked(resolve).mockReturnValueOnce(resolvedValueFixture);

        result = await new ServiceResolutionManager(
          planParamsOperationsManagerFixture,
          serviceReferenceManagerMock,
          autobindFixture,
          defaultScopeFixture,
        ).getAsync(serviceIdentifierFixture, getOptionsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceReferenceManager.planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: false,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional ?? false,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(
          serviceReferenceManagerMock.planResultCacheService.get,
        ).toHaveBeenCalledExactlyOnceWith(expectedGetPlanOptions);
      });

      it('should call plan()', () => {
        const expectedPlanParams: PlanParams = {
          autobindOptions: undefined,
          operations: planParamsOperationsManagerFixture.planParamsOperations,
          rootConstraints: {
            isMultiple: false,
            isOptional: getOptionsFixture.optional as true,
            name: getOptionsFixture.name as string,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag as GetOptionsTagConstraint,
          },
          servicesBranch: [],
        };

        expect(plan).toHaveBeenCalledExactlyOnceWith(expectedPlanParams);
      });

      it('should call resolve()', () => {
        const expectedResolveParams: ResolutionParams = {
          context: {
            get: expect.any(Function),
            getAll: expect.any(Function),
            getAllAsync: expect.any(Function),
            getAsync: expect.any(Function),
          } as unknown as ResolutionContext,
          getActivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingActivation<TActivated>> | undefined,
          planResult: planResultFixture,
          requestScopeCache: new Map(),
        };

        expect(resolve).toHaveBeenCalledExactlyOnceWith(expectedResolveParams);
      });

      it('should return expected value', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });
  });
});
