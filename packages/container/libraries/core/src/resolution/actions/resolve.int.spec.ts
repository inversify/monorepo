import { beforeAll, describe, expect, it } from '@jest/globals';

import 'reflect-metadata';

import { Newable, ServiceIdentifier } from '@inversifyjs/common';
import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

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
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { ActivationsService } from '../../binding/services/ActivationsService';
import { BindingService } from '../../binding/services/BindingService';
import { isPromise } from '../../common/calculations/isPromise';
import { Writable } from '../../common/models/Writable';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { getDefaultClassMetadata } from '../../metadata/calculations/getDefaultClassMetadata';
import { inject } from '../../metadata/decorators/inject';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { plan } from '../../planning/calculations/plan';
import { PlanParams } from '../../planning/models/PlanParams';
import { PlanParamsConstraint } from '../../planning/models/PlanParamsConstraint';
import { PlanResult } from '../../planning/models/PlanResult';
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
  provider = 'provider-service-id',
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

describe(resolve.name, () => {
  let activatedResolvedResult: unknown;

  let constantValueBinding: ConstantValueBinding<unknown>;
  let constantValueBindingWithActivation: ConstantValueBinding<unknown>;
  let dynamicValueBinding: DynamicValueBinding<unknown>;
  let factoryBinding: FactoryBinding<Factory<unknown>>;
  let instanceBinding: InstanceBinding<unknown>;
  let providerBinding: ProviderBinding<Provider<unknown>>;
  let serviceRedirectionBinding: ServiceRedirectionBinding<unknown>;
  let serviceRedirectionToNonExistentBinding: ServiceRedirectionBinding<unknown>;

  let activationService: ActivationsService;
  let bindingService: BindingService;
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

    const provider: Provider<unknown> = async () => Symbol();

    providerBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 4,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      provider: () => provider,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.provider,
      type: bindingTypeValues.Provider,
    };

    serviceRedirectionBinding = {
      id: 5,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      serviceIdentifier: ServiceIds.serviceRedirection,
      targetServiceIdentifier: constantValueBinding.serviceIdentifier,
      type: bindingTypeValues.ServiceRedirection,
    };

    serviceRedirectionToNonExistentBinding = {
      id: 6,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      serviceIdentifier: ServiceIds.serviceRedirectionToNonExistent,
      targetServiceIdentifier: ServiceIds.nonExistent,
      type: bindingTypeValues.ServiceRedirection,
    };

    activationService = new ActivationsService(undefined);
    bindingService = new BindingService(undefined);

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
    bindingService.set(providerBinding);
    bindingService.set(serviceRedirectionBinding);
    bindingService.set(serviceRedirectionToNonExistentBinding);

    getClassMetadataFunction = (type: Newable): ClassMetadata =>
      getReflectMetadata(type, classMetadataReflectKey) ??
      getDefaultClassMetadata();

    function buildPlanResult(
      isMultiple: boolean,
      serviceIdentifier: ServiceIdentifier,
      options: GetOptions | undefined,
    ): PlanResult {
      const planParams: PlanParams = {
        getBindings: bindingService.get.bind(bindingService),
        getClassMetadata: getClassMetadataFunction,
        rootConstraints: {
          isMultiple,
          serviceIdentifier,
        },
        servicesBranch: new Set(),
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
          'Unexpected asyncronous value',
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
            'Unexpected asyncronous value',
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
      () => factoryBinding.factory(resolutionContext),
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
      'with instance binding provider',
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
            getBindings: bindingService.get.bind(bindingService),
            getClassMetadata: getClassMetadataFunction,
            rootConstraints: planParamsConstraint(),
            servicesBranch: new Set(),
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

        it('should return expected result', () => {
          expect(result).toStrictEqual(expectedResult);
        });
      });
    },
  );
});
