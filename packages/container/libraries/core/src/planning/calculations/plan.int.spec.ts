import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata';

import { Newable } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

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
import { BindingService } from '../../binding/services/BindingService';
import { Writable } from '../../common/models/Writable';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { getDefaultClassMetadata } from '../../metadata/calculations/getDefaultClassMetadata';
import { inject } from '../../metadata/decorators/inject';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind';
import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { PlanParamsConstraint } from '../models/PlanParamsConstraint';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';
import { plan } from './plan';

enum ServiceIds {
  constantValue = 'constant-value-service-id',
  dynamicValue = 'dynamic-value-service-id',
  factory = 'factory-service-id',
  instance = 'instance-service-id',
  nonExistent = 'non-existent-service-id',
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

function buildLeafBindingPlanResult(
  binding:
    | ConstantValueBinding<unknown>
    | DynamicValueBinding<unknown>
    | FactoryBinding<Factory<unknown>>
    | ProviderBinding<Provider<unknown>>,
): PlanResult {
  const planServiceNode: PlanServiceNode = {
    bindings: [],
    parent: undefined,
    serviceIdentifier: binding.serviceIdentifier,
  };

  const planResult: PlanResult = {
    tree: {
      root: planServiceNode,
    },
  };

  (planServiceNode as Writable<PlanServiceNode>).bindings = {
    binding: binding,
    parent: planServiceNode,
  };

  return planResult;
}

function buildSimpleInstancePlanResult(
  constructorParameterBinding:
    | ConstantValueBinding<unknown>
    | DynamicValueBinding<unknown>
    | FactoryBinding<Factory<unknown>>
    | ProviderBinding<Provider<unknown>>,
  propertyKeyBindingPair: [
    string | symbol,
    (
      | ConstantValueBinding<unknown>
      | DynamicValueBinding<unknown>
      | FactoryBinding<Factory<unknown>>
      | ProviderBinding<Provider<unknown>>
    ),
  ],
  instanceBinding: InstanceBinding<unknown>,
): PlanResult {
  const planServiceNode: PlanServiceNode = {
    bindings: [],
    parent: undefined,
    serviceIdentifier: instanceBinding.serviceIdentifier,
  };

  const instanceBindingNode: InstanceBindingNode = {
    binding: instanceBinding,
    classMetadata: expect.any(Object) as unknown as ClassMetadata,
    constructorParams: [],
    parent: planServiceNode,
    propertyParams: new Map(),
  };

  const constructorParamServiceNode: PlanServiceNode = {
    bindings: [],
    parent: instanceBindingNode,
    serviceIdentifier: constructorParameterBinding.serviceIdentifier,
  };

  (constructorParamServiceNode as Writable<PlanServiceNode>).bindings = {
    binding: constructorParameterBinding,
    parent: constructorParamServiceNode,
  };

  instanceBindingNode.constructorParams.push(constructorParamServiceNode);

  const [propertyKey, propertyKeyBinding]: [
    string | symbol,
    (
      | ConstantValueBinding<unknown>
      | DynamicValueBinding<unknown>
      | FactoryBinding<Factory<unknown>>
      | ProviderBinding<Provider<unknown>>
    ),
  ] = propertyKeyBindingPair;

  const propertyServiceNode: PlanServiceNode = {
    bindings: [],
    parent: instanceBindingNode,
    serviceIdentifier: propertyKeyBinding.serviceIdentifier,
  };

  (propertyServiceNode as Writable<PlanServiceNode>).bindings = {
    binding: propertyKeyBinding,
    parent: propertyServiceNode,
  };

  instanceBindingNode.propertyParams.set(propertyKey, propertyServiceNode);

  (planServiceNode as Writable<PlanServiceNode>).bindings = instanceBindingNode;

  const planResult: PlanResult = {
    tree: {
      root: planServiceNode,
    },
  };

  return planResult;
}

function buildSimpleResolvedValuePlanResult(
  parameterBinding:
    | ConstantValueBinding<unknown>
    | DynamicValueBinding<unknown>
    | FactoryBinding<Factory<unknown>>
    | ProviderBinding<Provider<unknown>>,
  resolvedValueBinding: ResolvedValueBinding<unknown>,
): PlanResult {
  const planServiceNode: PlanServiceNode = {
    bindings: [],
    parent: undefined,
    serviceIdentifier: resolvedValueBinding.serviceIdentifier,
  };

  const instanceBindingNode: ResolvedValueBindingNode = {
    binding: resolvedValueBinding,
    params: [],
    parent: planServiceNode,
  };

  const constructorParamServiceNode: PlanServiceNode = {
    bindings: [],
    parent: instanceBindingNode,
    serviceIdentifier: parameterBinding.serviceIdentifier,
  };

  (constructorParamServiceNode as Writable<PlanServiceNode>).bindings = {
    binding: parameterBinding,
    parent: constructorParamServiceNode,
  };

  instanceBindingNode.params.push(constructorParamServiceNode);

  (planServiceNode as Writable<PlanServiceNode>).bindings = instanceBindingNode;

  const planResult: PlanResult = {
    tree: {
      root: planServiceNode,
    },
  };

  return planResult;
}

function buildServiceRedirectionToLeafBindingPlanResult(
  leafBinding:
    | ConstantValueBinding<unknown>
    | DynamicValueBinding<unknown>
    | FactoryBinding<Factory<unknown>>
    | ProviderBinding<Provider<unknown>>,
  serviceRedirectionBinding: ServiceRedirectionBinding<unknown>,
): PlanResult {
  const planServiceNode: PlanServiceNode = {
    bindings: [],
    parent: undefined,
    serviceIdentifier: serviceRedirectionBinding.serviceIdentifier,
  };

  const planResult: PlanResult = {
    tree: {
      root: planServiceNode,
    },
  };

  const serviceRedirectionBindingNode: PlanServiceRedirectionBindingNode = {
    binding: serviceRedirectionBinding,
    parent: planServiceNode,
    redirections: [],
  };

  serviceRedirectionBindingNode.redirections.push({
    binding: leafBinding,
    parent: serviceRedirectionBindingNode,
  });

  (planServiceNode as Writable<PlanServiceNode>).bindings =
    serviceRedirectionBindingNode;

  return planResult;
}

describe(plan.name, () => {
  let constantValueBinding: ConstantValueBinding<unknown>;
  let dynamicValueBinding: DynamicValueBinding<unknown>;
  let factoryBinding: FactoryBinding<Factory<unknown>>;
  let instanceBinding: InstanceBinding<unknown>;
  let providerBinding: ProviderBinding<Provider<unknown>>;
  let resolvedValueBinding: ResolvedValueBinding<unknown>;
  let serviceRedirectionBinding: ServiceRedirectionBinding<unknown>;
  let serviceRedirectionToNonExistentBinding: ServiceRedirectionBinding<unknown>;

  let bindingService: BindingService;
  let getClassMetadataFunction: (type: Newable) => ClassMetadata;

  beforeAll(() => {
    constantValueBinding = {
      cache: {
        isRight: true,
        value: Symbol(),
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
      value: () => Symbol(),
    };

    factoryBinding = {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory: () => (): unknown => Symbol(),
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
      provider: () => async () => Symbol(),
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: ServiceIds.provider,
      type: bindingTypeValues.Provider,
    };

    resolvedValueBinding = {
      cache: {
        isRight: true,
        value: Symbol(),
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

    bindingService = BindingService.build(undefined);

    bindingService.set(constantValueBinding);
    bindingService.set(dynamicValueBinding);
    bindingService.set(factoryBinding);
    bindingService.set(instanceBinding);
    bindingService.set(providerBinding);
    bindingService.set(resolvedValueBinding);
    bindingService.set(serviceRedirectionBinding);
    bindingService.set(serviceRedirectionToNonExistentBinding);

    getClassMetadataFunction = (type: Newable): ClassMetadata =>
      getOwnReflectMetadata(type, classMetadataReflectKey) ??
      getDefaultClassMetadata();
  });

  describe.each<[string, PlanParamsConstraint, () => PlanResult]>([
    [
      'with constant value bound service',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.constantValue,
      },
      () => buildLeafBindingPlanResult(constantValueBinding),
    ],
    [
      'with dynamic value bound service',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.dynamicValue,
      },
      () => buildLeafBindingPlanResult(dynamicValueBinding),
    ],
    [
      'with factory bound service',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.factory,
      },
      () => buildLeafBindingPlanResult(factoryBinding),
    ],
    [
      'with instance bound service',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.instance,
      },
      () =>
        buildSimpleInstancePlanResult(
          constantValueBinding,
          ['property', dynamicValueBinding],
          instanceBinding,
        ),
    ],
    [
      'with provider bound service',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.provider,
      },
      () => buildLeafBindingPlanResult(providerBinding),
    ],
    [
      'with resolved value bound service',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.resolvedValue,
      },
      () =>
        buildSimpleResolvedValuePlanResult(
          constantValueBinding,
          resolvedValueBinding,
        ),
    ],
    [
      'with service redirection bound service',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.serviceRedirection,
      },
      () =>
        buildServiceRedirectionToLeafBindingPlanResult(
          constantValueBinding,
          serviceRedirectionBinding,
        ),
    ],
  ])(
    'having plan params %s',
    (
      _: string,
      planParamsConstraint: PlanParamsConstraint,
      expectedResultBuilder: () => PlanResult,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = plan({
            autobindOptions: undefined,
            getBindings: bindingService.get.bind(bindingService),
            getClassMetadata: getClassMetadataFunction,
            rootConstraints: planParamsConstraint,
            servicesBranch: new Set(),
            setBinding: bindingService.set.bind(bindingService),
          });
        });

        it('should return expected plan', () => {
          expect(result).toStrictEqual(expectedResultBuilder());
        });
      });
    },
  );

  describe.each<[string, PlanParamsConstraint, Partial<InversifyCoreError>]>([
    [
      'with non existent service id',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.nonExistent,
      },
      {
        kind: InversifyCoreErrorKind.planning,
        message: `No bindings found for service: "${ServiceIds.nonExistent}".

Trying to resolve bindings for "${ServiceIds.nonExistent} (Root service)".

Binding constraints:
- service identifier: non-existent-service-id
- name: -`,
      },
    ],
    [
      'with service redirection to non existent service id',
      {
        isMultiple: false,
        serviceIdentifier: ServiceIds.serviceRedirectionToNonExistent,
      },
      {
        kind: InversifyCoreErrorKind.planning,
        message: `No bindings found for service: "${ServiceIds.nonExistent}".

Trying to resolve bindings for "${ServiceIds.serviceRedirectionToNonExistent}".

Binding constraints:
- service identifier: service-redirection-to-non-existent-service-id
- name: -`,
      },
    ],
  ])(
    'having plan params %s',
    (
      _: string,
      planParamsConstraint: PlanParamsConstraint,
      expectedErrorProperties: Partial<InversifyCoreError>,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            plan({
              autobindOptions: undefined,
              getBindings: bindingService.get.bind(bindingService),
              getClassMetadata: getClassMetadataFunction,
              rootConstraints: planParamsConstraint,
              servicesBranch: new Set(),
              setBinding: bindingService.set.bind(bindingService),
            });
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should return expected plan', () => {
          expect(result).toBeInstanceOf(InversifyCoreError);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    },
  );
});
