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
  Binding,
  BindingActivation,
  BindingActivationRelation,
  BindingConstraints,
  BindingDeactivation,
  BindingDeactivationRelation,
  BindingScope,
  bindingScopeValues,
  BindingService,
  bindingTypeValues,
  ClassMetadata,
  DeactivationParams,
  DeactivationsService,
  getClassMetadata,
  GetOptions,
  GetOptionsTagConstraint,
  GetPlanOptions,
  plan,
  PlanParams,
  PlanResult,
  PlanResultCacheService,
  ResolutionContext,
  ResolutionParams,
  resolve,
  resolveBindingsDeactivations,
  resolveModuleDeactivations,
  resolveServiceDeactivations,
} from '@inversifyjs/core';

import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { BindToFluentSyntaxImplementation } from '../../binding/models/BindingFluentSyntaxImplementation';
import {
  BindingIdentifier,
  bindingIdentifierSymbol,
} from '../../binding/models/BindingIdentifier';
import { getFirstIterableResult } from '../../common/calculations/getFirstIterableResult';
import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import {
  ContainerModule,
  ContainerModuleLoadOptions,
} from '../models/ContainerModule';
import { IsBoundOptions } from '../models/isBoundOptions';
import { Container } from './Container';

describe(Container.name, () => {
  let activationServiceMock: Mocked<ActivationsService>;
  let bindingServiceMock: Mocked<BindingService>;
  let deactivationServiceMock: Mocked<DeactivationsService>;

  let clearCacheMock: Mock<() => void>;
  let getPlanResultMock: Mock<
    (options: GetPlanOptions) => PlanResult | undefined
  >;
  let setPlanResultMock: Mock<
    (options: GetPlanOptions, planResult: PlanResult) => void
  >;

  beforeAll(() => {
    activationServiceMock = {
      add: vitest.fn(),
      clone: vitest.fn().mockReturnThis(),
      get: vitest.fn(),
      removeAllByModuleId: vitest.fn(),
      removeAllByServiceId: vitest.fn(),
    } as Partial<Mocked<ActivationsService>> as Mocked<ActivationsService>;
    bindingServiceMock = {
      clone: vitest.fn().mockReturnThis(),
      get: vitest.fn(),
      getById: vitest.fn(),
      getNonParentBindings: vitest.fn(),
      getNonParentBoundServices: vitest.fn(),
      removeAllByModuleId: vitest.fn(),
      removeAllByServiceId: vitest.fn(),
      removeById: vitest.fn(),
      set: vitest.fn(),
    } as Partial<Mocked<BindingService>> as Mocked<BindingService>;
    deactivationServiceMock = {
      add: vitest.fn(),
      clone: vitest.fn().mockReturnThis(),
      removeAllByModuleId: vitest.fn(),
      removeAllByServiceId: vitest.fn(),
    } as Partial<Mocked<DeactivationsService>> as Mocked<DeactivationsService>;

    clearCacheMock = vitest.fn();
    getPlanResultMock = vitest.fn();
    setPlanResultMock = vitest.fn();

    vitest
      .mocked(ActivationsService.build)
      .mockReturnValue(activationServiceMock);

    vitest.mocked(BindingService.build).mockReturnValue(bindingServiceMock);

    vitest
      .mocked(DeactivationsService.build)
      .mockReturnValue(deactivationServiceMock);

    vitest.mocked(PlanResultCacheService).mockImplementation(function (
      this: PlanResultCacheService,
    ): PlanResultCacheService {
      this.clearCache = clearCacheMock;
      this.get = getPlanResultMock;
      this.set = setPlanResultMock;

      return this;
    });
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
      });
    });
  });

  describe('.bind', () => {
    describe('when called', () => {
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(() => {
        serviceIdentifierFixture = 'service-id';

        result = new Container().bind(serviceIdentifierFixture);
      });

      it('should return BindToFluentSyntax', () => {
        const expected: BindToFluentSyntax<unknown> =
          new BindToFluentSyntaxImplementation(
            expect.any(Function) as unknown as (
              binding: Binding<unknown>,
            ) => void,
            undefined,
            bindingScopeValues.Transient,
            serviceIdentifierFixture,
          );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('.get', () => {
    describe('having a container with options with no autobind', () => {
      let container: Container;

      beforeAll(() => {
        container = new Container();
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

          result = container.get(serviceIdentifierFixture, getOptionsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(getPlanResultMock).toHaveBeenCalledTimes(1);
          expect(getPlanResultMock).toHaveBeenCalledWith(
            expectedGetPlanOptions,
          );
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: undefined,
            getBindings: expect.any(Function) as unknown as <TInstance>(
              serviceIdentifier: ServiceIdentifier<TInstance>,
            ) => Binding<TInstance>[] | undefined,
            getClassMetadata,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
            setBinding: expect.any(Function) as unknown as <TInstance>(
              binding: Binding<TInstance>,
            ) => void,
          };

          expect(plan).toHaveBeenCalledTimes(1);
          expect(plan).toHaveBeenCalledWith(expectedPlanParams);
        });

        it('should call planResultCacheService.set()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(setPlanResultMock).toHaveBeenCalledTimes(1);
          expect(setPlanResultMock).toHaveBeenCalledWith(
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

          expect(resolve).toHaveBeenCalledTimes(1);
          expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
        });

        it('should return expected value', () => {
          expect(result).toBe(resolvedValueFixture);
        });
      });

      describe('when called, and planResultCacheService.get() returns a plan', () => {
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

          getPlanResultMock.mockReturnValueOnce(planResultFixture);

          vitest.mocked(resolve).mockReturnValueOnce(resolvedValueFixture);

          result = container.get(serviceIdentifierFixture, getOptionsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(getPlanResultMock).toHaveBeenCalledTimes(1);
          expect(getPlanResultMock).toHaveBeenCalledWith(
            expectedGetPlanOptions,
          );
        });

        it('should not call plan', () => {
          expect(plan).not.toHaveBeenCalled();
        });

        it('should not call planResultCacheService.set', () => {
          expect(setPlanResultMock).not.toHaveBeenCalled();
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

          expect(resolve).toHaveBeenCalledTimes(1);
          expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
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
            container.get(serviceIdentifierFixture, getOptionsFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(getPlanResultMock).toHaveBeenCalledTimes(1);
          expect(getPlanResultMock).toHaveBeenCalledWith(
            expectedGetPlanOptions,
          );
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: undefined,
            getBindings: expect.any(Function) as unknown as <TInstance>(
              serviceIdentifier: ServiceIdentifier<TInstance>,
            ) => Binding<TInstance>[] | undefined,
            getClassMetadata,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
            setBinding: expect.any(Function) as unknown as <TInstance>(
              binding: Binding<TInstance>,
            ) => void,
          };

          expect(plan).toHaveBeenCalledTimes(1);
          expect(plan).toHaveBeenCalledWith(expectedPlanParams);
        });

        it('should call planResultCacheService.set()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(setPlanResultMock).toHaveBeenCalledTimes(1);
          expect(setPlanResultMock).toHaveBeenCalledWith(
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

          expect(resolve).toHaveBeenCalledTimes(1);
          expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message: `Unexpected asyncronous service when resolving service "${serviceIdentifierFixture as string}"`,
          };

          expect(result).toBeInstanceOf(InversifyContainerError);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    });

    describe('having a container with options with autobind true and default scope', () => {
      let defaultScopeFixture: BindingScope;
      let container: Container;

      beforeAll(() => {
        defaultScopeFixture = bindingScopeValues.Singleton;
        container = new Container({
          autobind: true,
          defaultScope: defaultScopeFixture,
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

          vitest.mocked(resolve).mockReturnValueOnce(resolvedValueFixture);

          result = container.get(serviceIdentifierFixture, getOptionsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(getPlanResultMock).toHaveBeenCalledTimes(1);
          expect(getPlanResultMock).toHaveBeenCalledWith(
            expectedGetPlanOptions,
          );
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: {
              scope: defaultScopeFixture,
            },
            getBindings: expect.any(Function) as unknown as <TInstance>(
              serviceIdentifier: ServiceIdentifier<TInstance>,
            ) => Binding<TInstance>[] | undefined,
            getClassMetadata,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
            setBinding: expect.any(Function) as unknown as <TInstance>(
              binding: Binding<TInstance>,
            ) => void,
          };

          expect(plan).toHaveBeenCalledTimes(1);
          expect(plan).toHaveBeenCalledWith(expectedPlanParams);
        });

        it('should call planResultCacheService.set()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(setPlanResultMock).toHaveBeenCalledTimes(1);
          expect(setPlanResultMock).toHaveBeenCalledWith(
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

          expect(resolve).toHaveBeenCalledTimes(1);
          expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
        });

        it('should return expected value', () => {
          expect(result).toBe(resolvedValueFixture);
        });
      });
    });

    describe('having a container with options with no autobind and default scope and GetOptions with scope', () => {
      let defaultScopeFixture: BindingScope;
      let container: Container;

      beforeAll(() => {
        defaultScopeFixture = bindingScopeValues.Singleton;
        container = new Container({
          defaultScope: defaultScopeFixture,
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

          result = container.get(serviceIdentifierFixture, getOptionsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call planResultCacheService.get()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(getPlanResultMock).toHaveBeenCalledTimes(1);
          expect(getPlanResultMock).toHaveBeenCalledWith(
            expectedGetPlanOptions,
          );
        });

        it('should call plan()', () => {
          const expectedPlanParams: PlanParams = {
            autobindOptions: {
              scope: defaultScopeFixture,
            },
            getBindings: expect.any(Function) as unknown as <TInstance>(
              serviceIdentifier: ServiceIdentifier<TInstance>,
            ) => Binding<TInstance>[] | undefined,
            getClassMetadata,
            rootConstraints: {
              isMultiple: false,
              isOptional: getOptionsFixture.optional as true,
              name: getOptionsFixture.name as string,
              serviceIdentifier: serviceIdentifierFixture,
              tag: getOptionsFixture.tag as GetOptionsTagConstraint,
            },
            servicesBranch: [],
            setBinding: expect.any(Function) as unknown as <TInstance>(
              binding: Binding<TInstance>,
            ) => void,
          };

          expect(plan).toHaveBeenCalledTimes(1);
          expect(plan).toHaveBeenCalledWith(expectedPlanParams);
        });

        it('should call planResultCacheService.set()', () => {
          const expectedGetPlanOptions: GetPlanOptions = {
            isMultiple: false,
            name: getOptionsFixture.name,
            optional: getOptionsFixture.optional,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag,
          };

          expect(setPlanResultMock).toHaveBeenCalledTimes(1);
          expect(setPlanResultMock).toHaveBeenCalledWith(
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

          expect(resolve).toHaveBeenCalledTimes(1);
          expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
        });

        it('should return expected value', () => {
          expect(result).toBe(resolvedValueFixture);
        });
      });
    });
  });

  describe('.getAll', () => {
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

        result = new Container().getAll(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(getPlanResultMock).toHaveBeenCalledTimes(1);
        expect(getPlanResultMock).toHaveBeenCalledWith(expectedGetPlanOptions);
      });

      it('should call plan()', () => {
        const expectedPlanParams: PlanParams = {
          autobindOptions: undefined,
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata,
          rootConstraints: {
            isMultiple: true,
            isOptional: getOptionsFixture.optional as true,
            name: getOptionsFixture.name as string,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag as GetOptionsTagConstraint,
          },
          servicesBranch: [],
          setBinding: expect.any(Function) as unknown as <TInstance>(
            binding: Binding<TInstance>,
          ) => void,
        };

        expect(plan).toHaveBeenCalledTimes(1);
        expect(plan).toHaveBeenCalledWith(expectedPlanParams);
      });

      it('should call planResultCacheService.set()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(setPlanResultMock).toHaveBeenCalledTimes(1);
        expect(setPlanResultMock).toHaveBeenCalledWith(
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

        expect(resolve).toHaveBeenCalledTimes(1);
        expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
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
          new Container().getAll(serviceIdentifierFixture, getOptionsFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(getPlanResultMock).toHaveBeenCalledTimes(1);
        expect(getPlanResultMock).toHaveBeenCalledWith(expectedGetPlanOptions);
      });

      it('should call plan()', () => {
        const expectedPlanParams: PlanParams = {
          autobindOptions: undefined,
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata,
          rootConstraints: {
            isMultiple: true,
            isOptional: getOptionsFixture.optional as true,
            name: getOptionsFixture.name as string,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag as GetOptionsTagConstraint,
          },
          servicesBranch: [],
          setBinding: expect.any(Function) as unknown as <TInstance>(
            binding: Binding<TInstance>,
          ) => void,
        };

        expect(plan).toHaveBeenCalledTimes(1);
        expect(plan).toHaveBeenCalledWith(expectedPlanParams);
      });

      it('should call planResultCacheService.set()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(setPlanResultMock).toHaveBeenCalledTimes(1);
        expect(setPlanResultMock).toHaveBeenCalledWith(
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

        expect(resolve).toHaveBeenCalledTimes(1);
        expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
      });

      it('should throw an InversifyContainerError', () => {
        const expectedErrorProperties: Partial<InversifyContainerError> = {
          kind: InversifyContainerErrorKind.invalidOperation,
          message: `Unexpected asyncronous service when resolving service "${serviceIdentifierFixture as string}"`,
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

        result = await new Container().getAllAsync(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(getPlanResultMock).toHaveBeenCalledTimes(1);
        expect(getPlanResultMock).toHaveBeenCalledWith(expectedGetPlanOptions);
      });

      it('should call plan()', () => {
        const expectedPlanParams: PlanParams = {
          autobindOptions: undefined,
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata,
          rootConstraints: {
            isMultiple: true,
            isOptional: getOptionsFixture.optional as true,
            name: getOptionsFixture.name as string,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag as GetOptionsTagConstraint,
          },
          servicesBranch: [],
          setBinding: expect.any(Function) as unknown as <TInstance>(
            binding: Binding<TInstance>,
          ) => void,
        };

        expect(plan).toHaveBeenCalledTimes(1);
        expect(plan).toHaveBeenCalledWith(expectedPlanParams);
      });

      it('should call planResultCacheService.set()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: true,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(setPlanResultMock).toHaveBeenCalledTimes(1);
        expect(setPlanResultMock).toHaveBeenCalledWith(
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

        expect(resolve).toHaveBeenCalledTimes(1);
        expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
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

        result = await new Container().getAsync(
          serviceIdentifierFixture,
          getOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call planResultCacheService.get()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: false,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(getPlanResultMock).toHaveBeenCalledTimes(1);
        expect(getPlanResultMock).toHaveBeenCalledWith(expectedGetPlanOptions);
      });

      it('should call plan()', () => {
        const expectedPlanParams: PlanParams = {
          autobindOptions: undefined,
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata,
          rootConstraints: {
            isMultiple: false,
            isOptional: getOptionsFixture.optional as true,
            name: getOptionsFixture.name as string,
            serviceIdentifier: serviceIdentifierFixture,
            tag: getOptionsFixture.tag as GetOptionsTagConstraint,
          },
          servicesBranch: [],
          setBinding: expect.any(Function) as unknown as <TInstance>(
            binding: Binding<TInstance>,
          ) => void,
        };

        expect(plan).toHaveBeenCalledTimes(1);
        expect(plan).toHaveBeenCalledWith(expectedPlanParams);
      });

      it('should call planResultCacheService.set()', () => {
        const expectedGetPlanOptions: GetPlanOptions = {
          isMultiple: false,
          name: getOptionsFixture.name,
          optional: getOptionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: getOptionsFixture.tag,
        };

        expect(setPlanResultMock).toHaveBeenCalledTimes(1);
        expect(setPlanResultMock).toHaveBeenCalledWith(
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

        expect(resolve).toHaveBeenCalledTimes(1);
        expect(resolve).toHaveBeenCalledWith(expectedResolveParams);
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

    describe('when called, and bindingService.get() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = new Container().isBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.get()', () => {
        expect(bindingServiceMock.get).toHaveBeenCalledTimes(1);
        expect(bindingServiceMock.get).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called, and bindingService.get() returns binding ann binding.isSatisfiedBy() returns false', () => {
      let bindingMock: Mocked<Binding>;

      let result: unknown;

      beforeAll(() => {
        bindingMock = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: vitest.fn(),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol.for('constant-value-binding-fixture-value'),
        };

        bindingServiceMock.get.mockReturnValueOnce([bindingMock]);

        bindingMock.isSatisfiedBy.mockReturnValueOnce(false);

        result = new Container().isBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.get()', () => {
        expect(bindingServiceMock.get).toHaveBeenCalledTimes(1);
        expect(bindingServiceMock.get).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should call binding.isSatisfiedBy()', () => {
        const expectedBindingConstraints: BindingConstraints = {
          getAncestor: expect.any(Function) as unknown as () =>
            | BindingConstraints
            | undefined,
          name: nameFixture,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map([[tagFixture.key, tagFixture.value]]),
        };

        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          expectedBindingConstraints,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called, and bindingService.get() returns binding ann binding.isSatisfiedBy() returns true', () => {
      let bindingMock: Mocked<Binding>;

      let result: unknown;

      beforeAll(() => {
        bindingMock = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: vitest.fn(),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol.for('constant-value-binding-fixture-value'),
        };

        bindingServiceMock.get.mockReturnValueOnce([bindingMock]);

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = new Container().isBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.get()', () => {
        expect(bindingServiceMock.get).toHaveBeenCalledTimes(1);
        expect(bindingServiceMock.get).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should call binding.isSatisfiedBy()', () => {
        const expectedBindingConstraints: BindingConstraints = {
          getAncestor: expect.any(Function) as unknown as () =>
            | BindingConstraints
            | undefined,
          name: nameFixture,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map([[tagFixture.key, tagFixture.value]]),
        };

        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          expectedBindingConstraints,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
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

    describe('when called, and bindingService.getNonParentBindings() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        bindingServiceMock.getNonParentBindings.mockReturnValueOnce(undefined);

        result = new Container().isCurrentBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.getNonParentBindings()', () => {
        expect(bindingServiceMock.getNonParentBindings).toHaveBeenCalledTimes(
          1,
        );
        expect(bindingServiceMock.getNonParentBindings).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called, and bindingService.getNonParentBindings() returns bindings and binding.isSatisfiedBy() returns false', () => {
      let bindingMock: Mocked<Binding>;

      let result: unknown;

      beforeAll(() => {
        bindingMock = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: vitest.fn(),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol.for('constant-value-binding-fixture-value'),
        };

        bindingServiceMock.getNonParentBindings.mockReturnValueOnce([
          bindingMock,
        ]);

        bindingMock.isSatisfiedBy.mockReturnValueOnce(false);

        result = new Container().isCurrentBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.getNonParentBindings()', () => {
        expect(bindingServiceMock.getNonParentBindings).toHaveBeenCalledTimes(
          1,
        );
        expect(bindingServiceMock.getNonParentBindings).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should call binding.isSatisfiedBy()', () => {
        const expectedBindingConstraints: BindingConstraints = {
          getAncestor: expect.any(Function) as unknown as () =>
            | BindingConstraints
            | undefined,
          name: nameFixture,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map([[tagFixture.key, tagFixture.value]]),
        };

        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          expectedBindingConstraints,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called, and bindingService.getNonParentBindings() returns bindings and binding.isSatisfiedBy() returns true', () => {
      let bindingMock: Mocked<Binding>;

      let result: unknown;

      beforeAll(() => {
        bindingMock = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: vitest.fn(),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol.for('constant-value-binding-fixture-value'),
        };

        bindingServiceMock.getNonParentBindings.mockReturnValueOnce([
          bindingMock,
        ]);

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = new Container().isCurrentBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.getNonParentBindings()', () => {
        expect(bindingServiceMock.getNonParentBindings).toHaveBeenCalledTimes(
          1,
        );
        expect(bindingServiceMock.getNonParentBindings).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should call binding.isSatisfiedBy()', () => {
        const expectedBindingConstraints: BindingConstraints = {
          getAncestor: expect.any(Function) as unknown as () =>
            | BindingConstraints
            | undefined,
          name: nameFixture,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map([[tagFixture.key, tagFixture.value]]),
        };

        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          expectedBindingConstraints,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
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
        result = await new Container().load(asyncContainerModuleMock);
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

        expect(asyncContainerModuleMock.load).toHaveBeenCalledTimes(1);
        expect(asyncContainerModuleMock.load).toHaveBeenCalledWith(options);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with a sync module', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await new Container().load(syncContainerModuleMock);
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

        expect(syncContainerModuleMock.load).toHaveBeenCalledTimes(1);
        expect(syncContainerModuleMock.load).toHaveBeenCalledWith(options);
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
        result = new Container().loadSync(syncContainerModuleMock);
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

        expect(syncContainerModuleMock.load).toHaveBeenCalledTimes(1);
        expect(syncContainerModuleMock.load).toHaveBeenCalledWith(options);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with an async module', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          new Container().loadSync(asyncContainerModuleMock);
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

        expect(asyncContainerModuleMock.load).toHaveBeenCalledTimes(1);
        expect(asyncContainerModuleMock.load).toHaveBeenCalledWith(options);
      });

      it('should throw an InversifyContainerError', () => {
        const expectedErrorProperties: Partial<InversifyContainerError> = {
          kind: InversifyContainerErrorKind.invalidOperation,
          message:
            'Unexpected asyncronous module load. Consider using Container.load() instead.',
        };

        expect(result).toBeInstanceOf(InversifyContainerError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
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
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(async () => {
        serviceIdentifierFixture = 'service-id';

        result = await new Container().rebind(serviceIdentifierFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceDeactivations', () => {
        const expectedParams: DeactivationParams = {
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getBindingsFromModule: expect.any(Function) as unknown as <TInstance>(
            moduleId: number,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata: expect.any(Function) as unknown as (
            type: Newable,
          ) => ClassMetadata,
          getDeactivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingDeactivation<TActivated>> | undefined,
        };

        expect(resolveServiceDeactivations).toHaveBeenCalledTimes(1);
        expect(resolveServiceDeactivations).toHaveBeenCalledWith(
          expectedParams,
          serviceIdentifierFixture,
        );
      });

      it('should call activationService.removeAllByServiceId()', () => {
        expect(
          activationServiceMock.removeAllByServiceId,
        ).toHaveBeenCalledTimes(1);
        expect(activationServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should call bindingService.removeAllByServiceId()', () => {
        expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledTimes(
          1,
        );
        expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should call deactivationService.removeAllByServiceId()', () => {
        expect(
          deactivationServiceMock.removeAllByServiceId,
        ).toHaveBeenCalledTimes(1);
        expect(
          deactivationServiceMock.removeAllByServiceId,
        ).toHaveBeenCalledWith(serviceIdentifierFixture);
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(clearCacheMock).toHaveBeenCalledTimes(1);
        expect(clearCacheMock).toHaveBeenCalledWith();
      });

      it('should return BindToFluentSyntax', () => {
        const expected: BindToFluentSyntax<unknown> =
          new BindToFluentSyntaxImplementation(
            expect.any(Function) as unknown as (
              binding: Binding<unknown>,
            ) => void,
            undefined,
            bindingScopeValues.Singleton,
            serviceIdentifierFixture,
          );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('.rebindSync', () => {
    describe('when called', () => {
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(async () => {
        serviceIdentifierFixture = 'service-id';

        result = new Container().rebindSync(serviceIdentifierFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceDeactivations', () => {
        const expectedParams: DeactivationParams = {
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getBindingsFromModule: expect.any(Function) as unknown as <TInstance>(
            moduleId: number,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata: expect.any(Function) as unknown as (
            type: Newable,
          ) => ClassMetadata,
          getDeactivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingDeactivation<TActivated>> | undefined,
        };

        expect(resolveServiceDeactivations).toHaveBeenCalledTimes(1);
        expect(resolveServiceDeactivations).toHaveBeenCalledWith(
          expectedParams,
          serviceIdentifierFixture,
        );
      });

      it('should call activationService.removeAllByServiceId()', () => {
        expect(
          activationServiceMock.removeAllByServiceId,
        ).toHaveBeenCalledTimes(1);
        expect(activationServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should call bindingService.removeAllByServiceId()', () => {
        expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledTimes(
          1,
        );
        expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
          serviceIdentifierFixture,
        );
      });

      it('should call deactivationService.removeAllByServiceId()', () => {
        expect(
          deactivationServiceMock.removeAllByServiceId,
        ).toHaveBeenCalledTimes(1);
        expect(
          deactivationServiceMock.removeAllByServiceId,
        ).toHaveBeenCalledWith(serviceIdentifierFixture);
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(clearCacheMock).toHaveBeenCalledTimes(1);
        expect(clearCacheMock).toHaveBeenCalledWith();
      });

      it('should return BindToFluentSyntax', () => {
        const expected: BindToFluentSyntax<unknown> =
          new BindToFluentSyntaxImplementation(
            expect.any(Function) as unknown as (
              binding: Binding<unknown>,
            ) => void,
            undefined,
            bindingScopeValues.Singleton,
            serviceIdentifierFixture,
          );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('.restore', () => {
    describe('having a container with no snapshots', () => {
      let container: Container;

      beforeAll(() => {
        container = new Container();
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            container.restore();
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message: 'No snapshot available to restore',
          };

          expect(result).toBeInstanceOf(InversifyContainerError);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    });

    describe('having a container with a snapshot', () => {
      let container: Container;

      beforeAll(() => {
        container = new Container();
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          container.snapshot();

          result = container.restore();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('.snapshot', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = new Container().snapshot();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationService.clone()', () => {
        expect(activationServiceMock.clone).toHaveBeenCalledTimes(1);
        expect(activationServiceMock.clone).toHaveBeenCalledWith();
      });

      it('should call bindingService.clone()', () => {
        expect(bindingServiceMock.clone).toHaveBeenCalledTimes(1);
        expect(bindingServiceMock.clone).toHaveBeenCalledWith();
      });

      it('should call deactivationService.clone()', () => {
        expect(deactivationServiceMock.clone).toHaveBeenCalledTimes(1);
        expect(deactivationServiceMock.clone).toHaveBeenCalledWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.unbind', () => {
    describe('having a ServiceIdentifier', () => {
      let serviceIdentifierFixture: ServiceIdentifier;

      beforeAll(() => {
        serviceIdentifierFixture = 'serviceId';
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          result = await new Container().unbind(serviceIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveServiceDeactivations', () => {
          const expectedParams: DeactivationParams = {
            getBindings: expect.any(Function) as unknown as <TInstance>(
              serviceIdentifier: ServiceIdentifier<TInstance>,
            ) => Binding<TInstance>[] | undefined,
            getBindingsFromModule: expect.any(Function) as unknown as <
              TInstance,
            >(
              moduleId: number,
            ) => Binding<TInstance>[] | undefined,
            getClassMetadata: expect.any(Function) as unknown as (
              type: Newable,
            ) => ClassMetadata,
            getDeactivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingDeactivation<TActivated>> | undefined,
          };

          expect(resolveServiceDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveServiceDeactivations).toHaveBeenCalledWith(
            expectedParams,
            serviceIdentifierFixture,
          );
        });

        it('should call activationService.removeAllByServiceId()', () => {
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledTimes(1);
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceIdentifierFixture);
        });

        it('should call bindingService.removeAllByServiceId()', () => {
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledTimes(
            1,
          );
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
            serviceIdentifierFixture,
          );
        });

        it('should call deactivationService.removeAllByServiceId()', () => {
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledTimes(1);
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceIdentifierFixture);
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and resolveServiceDeactivations() returns Promise', () => {
        let result: unknown;

        beforeAll(async () => {
          vitest
            .mocked(resolveServiceDeactivations)
            .mockResolvedValueOnce(undefined);

          result = await new Container().unbind(serviceIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveServiceDeactivations', () => {
          const expectedParams: DeactivationParams = {
            getBindings: expect.any(Function) as unknown as <TInstance>(
              serviceIdentifier: ServiceIdentifier<TInstance>,
            ) => Binding<TInstance>[] | undefined,
            getBindingsFromModule: expect.any(Function) as unknown as <
              TInstance,
            >(
              moduleId: number,
            ) => Binding<TInstance>[] | undefined,
            getClassMetadata: expect.any(Function) as unknown as (
              type: Newable,
            ) => ClassMetadata,
            getDeactivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingDeactivation<TActivated>> | undefined,
          };

          expect(resolveServiceDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveServiceDeactivations).toHaveBeenCalledWith(
            expectedParams,
            serviceIdentifierFixture,
          );
        });

        it('should call activationService.removeAllByServiceId()', () => {
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledTimes(1);
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceIdentifierFixture);
        });

        it('should call bindingService.removeAllByServiceId()', () => {
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledTimes(
            1,
          );
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
            serviceIdentifierFixture,
          );
        });

        it('should call deactivationService.removeAllByServiceId()', () => {
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledTimes(1);
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceIdentifierFixture);
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a BindingIdentifier', () => {
      let bindingIdentifierFixture: BindingIdentifier;

      beforeAll(() => {
        bindingIdentifierFixture = {
          [bindingIdentifierSymbol]: true,
          id: 1,
        };
      });

      describe('when called', () => {
        let bindingMock: Mocked<Binding>;
        let result: unknown;

        beforeAll(async () => {
          bindingMock = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: bindingIdentifierFixture.id,
            isSatisfiedBy: vitest.fn(),
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol.for('constant-value-binding-fixture-value'),
          };

          bindingServiceMock.getById.mockReturnValueOnce([bindingMock]);

          result = await new Container().unbind(bindingIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingService.getById()', () => {
          expect(bindingServiceMock.getById).toHaveBeenCalledTimes(1);
          expect(bindingServiceMock.getById).toHaveBeenCalledWith(
            bindingIdentifierFixture.id,
          );
        });

        it('should call resolveBindingsDeactivations()', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveBindingsDeactivations).toHaveBeenCalledWith(
            expect.any(Object),
            [bindingMock],
          );
        });

        it('should call bindingService.removeById()', () => {
          expect(bindingServiceMock.removeById).toHaveBeenCalledTimes(1);
          expect(bindingServiceMock.removeById).toHaveBeenCalledWith(
            bindingIdentifierFixture.id,
          );
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and resolveBindingsDeactivations() returns a Promise', () => {
        let bindingMock: Mocked<Binding>;
        let result: unknown;

        beforeAll(async () => {
          bindingMock = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: bindingIdentifierFixture.id,
            isSatisfiedBy: vitest.fn(),
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol.for('constant-value-binding-fixture-value'),
          };

          bindingServiceMock.getById.mockReturnValueOnce([bindingMock]);

          vitest
            .mocked(resolveBindingsDeactivations)
            .mockResolvedValueOnce(undefined);

          result = await new Container().unbind(bindingIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingService.getById()', () => {
          expect(bindingServiceMock.getById).toHaveBeenCalledTimes(1);
          expect(bindingServiceMock.getById).toHaveBeenCalledWith(
            bindingIdentifierFixture.id,
          );
        });

        it('should call resolveBindingsDeactivations()', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveBindingsDeactivations).toHaveBeenCalledWith(
            expect.any(Object),
            [bindingMock],
          );
        });

        it('should call bindingService.removeById()', () => {
          expect(bindingServiceMock.removeById).toHaveBeenCalledTimes(1);
          expect(bindingServiceMock.removeById).toHaveBeenCalledWith(
            bindingIdentifierFixture.id,
          );
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('unbindSync', () => {
    describe('having a ServiceIdentifier', () => {
      let serviceIdentifierFixture: ServiceIdentifier;

      beforeAll(() => {
        serviceIdentifierFixture = 'serviceId';
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = new Container().unbindSync(serviceIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveServiceDeactivations', () => {
          const expectedParams: DeactivationParams = {
            getBindings: expect.any(Function) as unknown as <TInstance>(
              serviceIdentifier: ServiceIdentifier<TInstance>,
            ) => Binding<TInstance>[] | undefined,
            getBindingsFromModule: expect.any(Function) as unknown as <
              TInstance,
            >(
              moduleId: number,
            ) => Binding<TInstance>[] | undefined,
            getClassMetadata: expect.any(Function) as unknown as (
              type: Newable,
            ) => ClassMetadata,
            getDeactivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingDeactivation<TActivated>> | undefined,
          };

          expect(resolveServiceDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveServiceDeactivations).toHaveBeenCalledWith(
            expectedParams,
            serviceIdentifierFixture,
          );
        });

        it('should call activationService.removeAllByServiceId()', () => {
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledTimes(1);
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceIdentifierFixture);
        });

        it('should call bindingService.removeAllByServiceId()', () => {
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledTimes(
            1,
          );
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
            serviceIdentifierFixture,
          );
        });

        it('should call deactivationService.removeAllByServiceId()', () => {
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledTimes(1);
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceIdentifierFixture);
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and resolveServiceDeactivations() returns Promise', () => {
        let result: unknown;

        beforeAll(() => {
          vitest
            .mocked(resolveServiceDeactivations)
            .mockResolvedValueOnce(undefined);

          try {
            new Container().unbindSync(serviceIdentifierFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveServiceDeactivations', () => {
          const expectedParams: DeactivationParams = {
            getBindings: expect.any(Function) as unknown as <TInstance>(
              serviceIdentifier: ServiceIdentifier<TInstance>,
            ) => Binding<TInstance>[] | undefined,
            getBindingsFromModule: expect.any(Function) as unknown as <
              TInstance,
            >(
              moduleId: number,
            ) => Binding<TInstance>[] | undefined,
            getClassMetadata: expect.any(Function) as unknown as (
              type: Newable,
            ) => ClassMetadata,
            getDeactivations: expect.any(Function) as unknown as <TActivated>(
              serviceIdentifier: ServiceIdentifier<TActivated>,
            ) => Iterable<BindingDeactivation<TActivated>> | undefined,
          };

          expect(resolveServiceDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveServiceDeactivations).toHaveBeenCalledWith(
            expectedParams,
            serviceIdentifierFixture,
          );
        });

        it('should call activationService.removeAllByServiceId()', () => {
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledTimes(1);
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceIdentifierFixture);
        });

        it('should call bindingService.removeAllByServiceId()', () => {
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledTimes(
            1,
          );
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
            serviceIdentifierFixture,
          );
        });

        it('should call deactivationService.removeAllByServiceId()', () => {
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledTimes(1);
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceIdentifierFixture);
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message:
              'Unexpected asyncronous deactivation when unbinding "serviceId" service. Consider using Container.unbind() instead.',
          };

          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    });

    describe('having a BindingIdentifier', () => {
      let bindingIdentifierFixture: BindingIdentifier;

      beforeAll(() => {
        bindingIdentifierFixture = {
          [bindingIdentifierSymbol]: true,
          id: 1,
        };
      });

      describe('when called', () => {
        let bindingMock: Mocked<Binding>;
        let result: unknown;

        beforeAll(() => {
          bindingMock = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: bindingIdentifierFixture.id,
            isSatisfiedBy: vitest.fn(),
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol.for('constant-value-binding-fixture-value'),
          };

          bindingServiceMock.getById.mockReturnValueOnce([bindingMock]);

          result = new Container().unbindSync(bindingIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingService.getById()', () => {
          expect(bindingServiceMock.getById).toHaveBeenCalledTimes(1);
          expect(bindingServiceMock.getById).toHaveBeenCalledWith(
            bindingIdentifierFixture.id,
          );
        });

        it('should call resolveBindingsDeactivations()', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveBindingsDeactivations).toHaveBeenCalledWith(
            expect.any(Object),
            [bindingMock],
          );
        });

        it('should call bindingService.removeById()', () => {
          expect(bindingServiceMock.removeById).toHaveBeenCalledTimes(1);
          expect(bindingServiceMock.removeById).toHaveBeenCalledWith(
            bindingIdentifierFixture.id,
          );
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and resolveBindingsDeactivations() returns a  and getFirstIterableResult() returns undefined', () => {
        let bindingMock: Mocked<Binding>;
        let result: unknown;

        beforeAll(() => {
          bindingMock = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: bindingIdentifierFixture.id,
            isSatisfiedBy: vitest.fn(),
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol.for('constant-value-binding-fixture-value'),
          };

          bindingServiceMock.getById
            .mockReturnValueOnce([bindingMock])
            .mockReturnValueOnce(undefined);

          vitest
            .mocked(resolveBindingsDeactivations)
            .mockResolvedValueOnce(undefined);

          vitest.mocked(getFirstIterableResult).mockReturnValueOnce(undefined);

          try {
            new Container().unbindSync(bindingIdentifierFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingService.getById()', () => {
          expect(bindingServiceMock.getById).toHaveBeenCalledTimes(2);
          expect(bindingServiceMock.getById).toHaveBeenNthCalledWith(
            1,
            bindingIdentifierFixture.id,
          );
          expect(bindingServiceMock.getById).toHaveBeenNthCalledWith(
            2,
            bindingIdentifierFixture.id,
          );
        });

        it('should call resolveBindingsDeactivations()', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveBindingsDeactivations).toHaveBeenCalledWith(
            expect.any(Object),
            [bindingMock],
          );
        });

        it('should call bindingService.removeById()', () => {
          expect(bindingServiceMock.removeById).toHaveBeenCalledTimes(1);
          expect(bindingServiceMock.removeById).toHaveBeenCalledWith(
            bindingIdentifierFixture.id,
          );
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message:
              'Unexpected asyncronous deactivation when unbinding binding identifier. Consider using Container.unbind() instead.',
          };

          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });

      describe('when called, and resolveBindingsDeactivations() returns a  and getFirstIterableResult() returns Binding', () => {
        let bindingMock: Mocked<Binding>;
        let result: unknown;

        beforeAll(() => {
          bindingMock = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: bindingIdentifierFixture.id,
            isSatisfiedBy: vitest.fn(),
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol.for('constant-value-binding-fixture-value'),
          };

          bindingServiceMock.getById
            .mockReturnValueOnce([bindingMock])
            .mockReturnValueOnce([bindingMock]);

          vitest
            .mocked(resolveBindingsDeactivations)
            .mockResolvedValueOnce(undefined);

          vitest
            .mocked(getFirstIterableResult)
            .mockReturnValueOnce(bindingMock);

          try {
            new Container().unbindSync(bindingIdentifierFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingService.getById()', () => {
          expect(bindingServiceMock.getById).toHaveBeenCalledTimes(2);
          expect(bindingServiceMock.getById).toHaveBeenNthCalledWith(
            1,
            bindingIdentifierFixture.id,
          );
          expect(bindingServiceMock.getById).toHaveBeenNthCalledWith(
            2,
            bindingIdentifierFixture.id,
          );
        });

        it('should call resolveBindingsDeactivations()', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledTimes(1);
          expect(resolveBindingsDeactivations).toHaveBeenCalledWith(
            expect.any(Object),
            [bindingMock],
          );
        });

        it('should call bindingService.removeById()', () => {
          expect(bindingServiceMock.removeById).toHaveBeenCalledTimes(1);
          expect(bindingServiceMock.removeById).toHaveBeenCalledWith(
            bindingIdentifierFixture.id,
          );
        });

        it('should call planResultCacheService.clearCache()', () => {
          expect(clearCacheMock).toHaveBeenCalledTimes(1);
          expect(clearCacheMock).toHaveBeenCalledWith();
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message:
              'Unexpected asyncronous deactivation when unbinding "service-id" binding. Consider using Container.unbind() instead.',
          };

          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    });
  });

  describe('.unbindAll', () => {
    describe('when called', () => {
      let serviceIdsFixture: string[];
      let result: unknown;

      beforeAll(async () => {
        serviceIdsFixture = ['service1', 'service2'];
        bindingServiceMock.getNonParentBoundServices.mockReturnValueOnce(
          serviceIdsFixture,
        );

        result = await new Container().unbindAll();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceDeactivations for each service', () => {
        expect(resolveServiceDeactivations).toHaveBeenCalledTimes(
          serviceIdsFixture.length,
        );

        for (const serviceId of serviceIdsFixture) {
          expect(resolveServiceDeactivations).toHaveBeenCalledWith(
            expect.any(Object),
            serviceId,
          );
        }
      });

      it('should call removeAllByServiceId on activationService for each service', () => {
        expect(
          activationServiceMock.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            activationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call removeAllByServiceId on bindingService for each service', () => {
        expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledTimes(
          serviceIdsFixture.length,
        );

        for (const serviceId of serviceIdsFixture) {
          expect(bindingServiceMock.removeAllByServiceId).toHaveBeenCalledWith(
            serviceId,
          );
        }
      });

      it('should call removeAllByServiceId on deactivationService for each service', () => {
        expect(
          deactivationServiceMock.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            deactivationServiceMock.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(clearCacheMock).toHaveBeenCalledTimes(1);
        expect(clearCacheMock).toHaveBeenCalledWith();
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

      it('should call resolveModuleDeactivations', () => {
        const expectedParams: DeactivationParams = {
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getBindingsFromModule: expect.any(Function) as unknown as <TInstance>(
            moduleId: number,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata: expect.any(Function) as unknown as (
            type: Newable,
          ) => ClassMetadata,
          getDeactivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingDeactivation<TActivated>> | undefined,
        };

        expect(resolveModuleDeactivations).toHaveBeenCalledTimes(1);
        expect(resolveModuleDeactivations).toHaveBeenCalledWith(
          expectedParams,
          containerModuleFixture.id,
        );
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(clearCacheMock).toHaveBeenCalledTimes(1);
        expect(clearCacheMock).toHaveBeenCalledWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.unloadSync', () => {
    let syncContainerModuleFixture: ContainerModule;
    let asyncContainerModuleFixture: ContainerModule;

    beforeAll(() => {
      syncContainerModuleFixture = {
        id: 2,
      } as Partial<ContainerModule> as ContainerModule;

      asyncContainerModuleFixture = {
        id: 3,
      } as Partial<ContainerModule> as ContainerModule;
    });

    describe('when called, and resolveModuleDeactivations() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(resolveModuleDeactivations)
          .mockReturnValueOnce(undefined);

        result = new Container().unloadSync(syncContainerModuleFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveModuleDeactivations', () => {
        const expectedParams: DeactivationParams = {
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getBindingsFromModule: expect.any(Function) as unknown as <TInstance>(
            moduleId: number,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata: expect.any(Function) as unknown as (
            type: Newable,
          ) => ClassMetadata,
          getDeactivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingDeactivation<TActivated>> | undefined,
        };

        expect(resolveModuleDeactivations).toHaveBeenCalledTimes(1);
        expect(resolveModuleDeactivations).toHaveBeenCalledWith(
          expectedParams,
          syncContainerModuleFixture.id,
        );
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(clearCacheMock).toHaveBeenCalledTimes(1);
        expect(clearCacheMock).toHaveBeenCalledWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and resolveModuleDeactivations() returns Promise', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(resolveModuleDeactivations)
          .mockResolvedValueOnce(undefined);

        try {
          new Container().unloadSync(asyncContainerModuleFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveModuleDeactivations', () => {
        const expectedParams: DeactivationParams = {
          getBindings: expect.any(Function) as unknown as <TInstance>(
            serviceIdentifier: ServiceIdentifier<TInstance>,
          ) => Binding<TInstance>[] | undefined,
          getBindingsFromModule: expect.any(Function) as unknown as <TInstance>(
            moduleId: number,
          ) => Binding<TInstance>[] | undefined,
          getClassMetadata: expect.any(Function) as unknown as (
            type: Newable,
          ) => ClassMetadata,
          getDeactivations: expect.any(Function) as unknown as <TActivated>(
            serviceIdentifier: ServiceIdentifier<TActivated>,
          ) => Iterable<BindingDeactivation<TActivated>> | undefined,
        };

        expect(resolveModuleDeactivations).toHaveBeenCalledTimes(1);
        expect(resolveModuleDeactivations).toHaveBeenCalledWith(
          expectedParams,
          asyncContainerModuleFixture.id,
        );
      });

      it('should throw InversifyContainerError', () => {
        const expectedErrorProperties: Partial<InversifyContainerError> = {
          kind: InversifyContainerErrorKind.invalidOperation,
          message:
            'Unexpected asyncronous module unload. Consider using Container.unload() instead.',
        };

        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
