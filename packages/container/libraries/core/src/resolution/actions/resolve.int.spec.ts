import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { isPromise, Newable, ServiceIdentifier } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { BindingActivation } from '../../binding/models/BindingActivation';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { ConstantValueBinding } from '../../binding/models/ConstantValueBinding';
import { DynamicValueBinding } from '../../binding/models/DynamicValueBinding';
import { Factory } from '../../binding/models/Factory';
import { FactoryBinding } from '../../binding/models/FactoryBinding';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { Provider } from '../../binding/models/Provider';
import { ProviderBinding } from '../../binding/models/ProviderBinding';
import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { ActivationsService } from '../../binding/services/ActivationsService';
import { BindingService } from '../../binding/services/BindingService';
import { Writable } from '../../common/models/Writable';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { getDefaultClassMetadata } from '../../metadata/calculations/getDefaultClassMetadata';
import { inject } from '../../metadata/decorators/inject';
import { optional } from '../../metadata/decorators/optional';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind';
import { plan } from '../../planning/actions/plan';
import { PlanParams } from '../../planning/models/PlanParams';
import { PlanParamsConstraint } from '../../planning/models/PlanParamsConstraint';
import { PlanResult } from '../../planning/models/PlanResult';
import { PlanResultCacheService } from '../../planning/services/PlanResultCacheService';
import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { GetOptions } from '../models/GetOptions';
import { OptionalGetOptions } from '../models/OptionalGetOptions';
import { ResolutionContext } from '../models/ResolutionContext';
import { Resolved } from '../models/Resolved';
import { resolve } from './resolve';

enum ServiceIds {
  constantValue = 'constant-value-service-id',
  constantValueWithActivation = 'constant-value-with-activation-service-id',
  dynamicValue = 'dynamic-value-service-id',
  factory = 'factory-service-id',
  instance = 'instance-service-id',
  nonExistent = 'non-existent-service-id',
  priest = 'priest-instance-service-id',
  provider = 'provider-service-id',
  resolvedValue = 'resolved-value-service-id',
  serviceRedirection = 'service-redirection-service-id',
  serviceRedirectionToNonExistent = 'service-redirection-to-non-existent-service-id',
}

class Foo {
  @inject(ServiceIds.dynamicValue)
  public readonly property!: symbol;

  constructor(
    @inject(ServiceIds.constantValue)
    _param: symbol,
  ) {}
}

class Priest {
  @inject(ServiceIds.nonExistent)
  @optional()
  public relic: unknown = Symbol.for('relic');
}

describe(resolve, () => {
  let activatedResolvedResult: unknown;

  let constantValueBinding: ConstantValueBinding<unknown>;
  let constantValueBindingWithActivation: ConstantValueBinding<unknown>;
  let dynamicValueBinding: DynamicValueBinding<unknown>;
  let factoryBinding: FactoryBinding<Factory<unknown>>;
  let instanceBinding: InstanceBinding<unknown>;
  let priestInstanceBinding: InstanceBinding<Priest>;
  let providerBinding: ProviderBinding<Provider<unknown>>; // eslint-disable-line @typescript-eslint/no-deprecated
  let resolvedValueBinding: ResolvedValueBinding<unknown>;
  let serviceRedirectionBinding: ServiceRedirectionBinding<unknown>;
  let serviceRedirectionToNonExistentBinding: ServiceRedirectionBinding<unknown>;

  let activationService: ActivationsService;
  let bindingService: BindingService;
  let planResultCacheService: PlanResultCacheService;
  let getClassMetadataFunction: (type: Newable) => ClassMetadata;

  let resolutionContext: ResolutionContext;

  beforeAll(() => {
    activatedResolvedResult = { foo: 'bar' };

    constantValueBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 0,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.constantValue,
      type: bindingTypeValues.ConstantValue,
      value: Symbol(),
    };

    constantValueBindingWithActivation = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 0,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: () => activatedResolvedResult,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.constantValueWithActivation,
      type: bindingTypeValues.ConstantValue,
      value: Symbol(),
    };

    dynamicValueBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.dynamicValue,
      type: bindingTypeValues.DynamicValue,
      value: () => Symbol.for('dynamic-value-binding'),
    };

    const factory: Factory<unknown> = (): unknown => Symbol();

    factoryBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory: () => factory,
      id: 2,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.factory,
      type: bindingTypeValues.Factory,
    };

    instanceBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 3,
      implementationType: Foo,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.instance,
      type: bindingTypeValues.Instance,
    };

    priestInstanceBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 4,
      implementationType: Priest,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.priest,
      type: bindingTypeValues.Instance,
    };

    const provider: Provider<unknown> = async () => Symbol(); // eslint-disable-line @typescript-eslint/no-deprecated

    providerBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 5,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      provider: () => provider,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.provider,
      type: bindingTypeValues.Provider,
    };

    resolvedValueBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory: (param: unknown) => param,
      id: 5,
      isSatisfiedBy: () => true,
      metadata: {
        arguments: [
          {
            kind: ResolvedValueElementMetadataKind.singleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            value: ServiceIds.constantValue,
          },
        ],
      },
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.resolvedValue,
      type: bindingTypeValues.ResolvedValue,
    };

    serviceRedirectionBinding = {
      id: 6,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      serviceIdentifier: ServiceIds.serviceRedirection,
      targetServiceIdentifier: constantValueBinding.serviceIdentifier,
      type: bindingTypeValues.ServiceRedirection,
    };

    serviceRedirectionToNonExistentBinding = {
      id: 7,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      serviceIdentifier: ServiceIds.serviceRedirectionToNonExistent,
      targetServiceIdentifier: ServiceIds.nonExistent,
      type: bindingTypeValues.ServiceRedirection,
    };

    activationService = ActivationsService.build(() => undefined);
    bindingService = BindingService.build(() => undefined);

    activationService.add(
      constantValueBindingWithActivation.onActivation as BindingActivation,
      {
        serviceId: constantValueBindingWithActivation.serviceIdentifier,
      },
    );

    bindingService.set(constantValueBinding);
    bindingService.set(constantValueBindingWithActivation);
    bindingService.set(dynamicValueBinding);
    bindingService.set(factoryBinding);
    bindingService.set(instanceBinding);
    bindingService.set(priestInstanceBinding);
    bindingService.set(providerBinding);
    bindingService.set(resolvedValueBinding);
    bindingService.set(serviceRedirectionBinding);
    bindingService.set(serviceRedirectionToNonExistentBinding);

    getClassMetadataFunction = (type: Newable): ClassMetadata =>
      getOwnReflectMetadata(type, classMetadataReflectKey) ??
      getDefaultClassMetadata();

    planResultCacheService = new PlanResultCacheService();

    function buildPlanResult(
      isMultiple: boolean,
      serviceIdentifier: ServiceIdentifier,
      options: GetOptions | undefined,
    ): PlanResult {
      const planParams: PlanParams = {
        autobindOptions: undefined,
        operations: {
          getBindings: bindingService.get.bind(bindingService),
          getBindingsChained: bindingService.getChained.bind(bindingService),
          getClassMetadata: getClassMetadataFunction,
          getPlan: planResultCacheService.get.bind(planResultCacheService),
          setBinding: bindingService.set.bind(bindingService),
          setNonCachedServiceNode:
            planResultCacheService.setNonCachedServiceNode.bind(
              planResultCacheService,
            ),
          setPlan: planResultCacheService.set.bind(planResultCacheService),
        },
        rootConstraints: {
          chained: false,
          isMultiple,
          serviceIdentifier,
        },
        servicesBranch: [],
      };

      handlePlanParamsRootConstraints(planParams, options);

      return plan(planParams);
    }

    function handlePlanParamsRootConstraints(
      planParams: PlanParams,
      options: GetOptions | undefined,
    ): void {
      if (options === undefined) {
        return;
      }

      if (options.name !== undefined) {
        planParams.rootConstraints.name = options.name;
      }

      if (options.optional === true) {
        planParams.rootConstraints.isOptional = true;
      }

      if (options.tag !== undefined) {
        planParams.rootConstraints.tag = {
          key: options.tag.key,
          value: options.tag.value,
        };
      }
    }

    function getResolved<TActivated, TMultiple extends boolean>(
      isMultiple: TMultiple,
      serviceIdentifier: ServiceIdentifier<TActivated>,
      options?: GetOptions,
    ): TMultiple extends false
      ? Resolved<TActivated> | undefined
      : TMultiple extends true
        ? Resolved<TActivated[]>
        : Resolved<TActivated[]> | Resolved<TActivated> | undefined {
      const planResult: PlanResult = buildPlanResult(
        isMultiple,
        serviceIdentifier,
        options,
      );

      return resolve({
        context: resolutionContext,
        getActivations: <TActivated>(
          serviceIdentifier: ServiceIdentifier,
        ): BindingActivation<TActivated>[] | undefined =>
          activationService.get(serviceIdentifier) as
            | BindingActivation<TActivated>[]
            | undefined,
        planResult,
        requestScopeCache: new Map(),
      }) as TMultiple extends false
        ? Resolved<TActivated> | undefined
        : TMultiple extends true
          ? Resolved<TActivated[]>
          : Resolved<TActivated[]> | Resolved<TActivated> | undefined;
    }

    function handleGet<TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
      options: OptionalGetOptions,
    ): TActivated | undefined;
    function handleGet<TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
      options?: GetOptions,
    ): TActivated;
    function handleGet<TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
      options?: GetOptions,
    ): TActivated | undefined {
      const resolveResult: Resolved<TActivated> | undefined = getResolved(
        false,
        serviceIdentifier,
        options,
      );

      if (isPromise(resolveResult)) {
        throw new InversifyCoreError(
          InversifyCoreErrorKind.resolution,
          'Unexpected asynchronous value',
        );
      }

      return resolveResult;
    }

    function handleGetAsync<TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
      options: OptionalGetOptions,
    ): Promise<TActivated> | undefined;
    function handleGetAsync<TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
      options?: GetOptions,
    ): Promise<TActivated>;
    function handleGetAsync<TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
      options?: GetOptions,
    ): Promise<TActivated> | undefined {
      const resolveResult: Resolved<TActivated> | undefined = getResolved(
        false,
        serviceIdentifier,
        options,
      );

      return resolveResult as Promise<TActivated> | undefined;
    }

    resolutionContext = {
      get: handleGet,
      getAll: <TActivated>(
        serviceIdentifier: ServiceIdentifier<TActivated>,
        options?: GetOptions,
      ): TActivated[] => {
        const resolveResult: Resolved<TActivated[]> = getResolved(
          true,
          serviceIdentifier,
          options,
        );

        if (isPromise(resolveResult)) {
          throw new InversifyCoreError(
            InversifyCoreErrorKind.resolution,
            'Unexpected asynchronous value',
          );
        }

        return resolveResult;
      },
      getAllAsync: async <TActivated>(
        serviceIdentifier: ServiceIdentifier<TActivated>,
        options?: GetOptions,
      ): Promise<TActivated[]> => {
        return getResolved(true, serviceIdentifier, options);
      },
      getAsync: handleGetAsync,
    };
  });

  describe.each<[string, () => PlanParamsConstraint, () => unknown]>([
    [
      'with constant value bound service',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: constantValueBinding.serviceIdentifier,
      }),
      () => constantValueBinding.value,
    ],
    [
      'with constant value bound service with activation',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: constantValueBindingWithActivation.serviceIdentifier,
      }),
      () => activatedResolvedResult,
    ],
    [
      'with dynamic value bound service',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: dynamicValueBinding.serviceIdentifier,
      }),
      () => dynamicValueBinding.value(resolutionContext),
    ],
    [
      'with factory bound service',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: factoryBinding.serviceIdentifier,
      }),
      (): Factory<unknown> | Promise<Factory<unknown>> =>
        factoryBinding.factory(resolutionContext),
    ],
    [
      'with provider bound service',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: providerBinding.serviceIdentifier,
      }),
      () => providerBinding.provider(resolutionContext),
    ],
    [
      'with instance binding service',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: instanceBinding.serviceIdentifier,
      }),
      () =>
        ((): Foo => {
          const instance: Foo = new Foo(constantValueBinding.value as symbol);

          (instance as Writable<Foo>).property = dynamicValueBinding.value(
            resolutionContext,
          ) as symbol;

          return instance;
        })(),
    ],
    [
      'with priest instance binding service',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: priestInstanceBinding.serviceIdentifier,
      }),
      () => new Priest(),
    ],
    [
      'with resolved value bound service',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: resolvedValueBinding.serviceIdentifier,
      }),
      () => constantValueBinding.value,
    ],
    [
      'with service redirection bound service',
      (): PlanParamsConstraint => ({
        isMultiple: false,
        serviceIdentifier: serviceRedirectionBinding.serviceIdentifier,
      }),
      () => constantValueBinding.value,
    ],
  ])(
    'having plan params %s',
    (
      _: string,
      planParamsConstraint: () => PlanParamsConstraint,
      expectedResultBuilder: () => unknown,
    ) => {
      describe('when called', () => {
        let expectedResult: unknown;

        let result: unknown;

        beforeAll(() => {
          expectedResult = expectedResultBuilder();

          const planResult: PlanResult = plan({
            autobindOptions: undefined,
            operations: {
              getBindings: bindingService.get.bind(bindingService),
              getBindingsChained:
                bindingService.getChained.bind(bindingService),
              getClassMetadata: getClassMetadataFunction,
              getPlan: planResultCacheService.get.bind(planResultCacheService),
              setBinding: bindingService.set.bind(bindingService),
              setNonCachedServiceNode:
                planResultCacheService.setNonCachedServiceNode.bind(
                  planResultCacheService,
                ),
              setPlan: planResultCacheService.set.bind(planResultCacheService),
            },
            rootConstraints: planParamsConstraint(),
            servicesBranch: [],
          });

          result = resolve({
            context: resolutionContext,
            getActivations: <TActivated>(
              serviceIdentifier: ServiceIdentifier,
            ): BindingActivation<TActivated>[] | undefined =>
              activationService.get(serviceIdentifier) as
                | BindingActivation<TActivated>[]
                | undefined,
            planResult,
            requestScopeCache: new Map(),
          });
        });

        afterAll(() => {
          planResultCacheService.clearCache();
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual(expectedResult);
        });
      });
    },
  );
});
