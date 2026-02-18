import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { type Newable } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { BindingService } from '../../binding/services/BindingService.js';
import { type Writable } from '../../common/models/Writable.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { getDefaultClassMetadata } from '../../metadata/calculations/getDefaultClassMetadata.js';
import { inject } from '../../metadata/decorators/inject.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind.js';
import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanParamsConstraint } from '../models/PlanParamsConstraint.js';
import { type PlanResult } from '../models/PlanResult.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { PlanResultCacheService } from '../services/PlanResultCacheService.js';
import { plan } from './plan.js';

enum ServiceIds {
  constantValue = 'constant-value-service-id',
  dynamicValue = 'dynamic-value-service-id',
  factory = 'factory-service-id',
  instance = 'instance-service-id',
  nonExistent = 'non-existent-service-id',
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
    | FactoryBinding<Factory<unknown>>,
): PlanResult {
  const planServiceNode: PlanServiceNode = {
    bindings: [],
    isContextFree: true,
    serviceIdentifier: binding.serviceIdentifier,
  };

  const planResult: PlanResult = {
    tree: {
      root: expect.objectContaining(planServiceNode),
    },
  };

  (planServiceNode as Writable<PlanServiceNode>).bindings = {
    binding: binding,
  };

  return planResult;
}

function buildSimpleInstancePlanResult(
  constructorParameterBinding:
    | ConstantValueBinding<unknown>
    | DynamicValueBinding<unknown>
    | FactoryBinding<Factory<unknown>>,
  propertyKeyBindingPair: [
    string | symbol,
    (
      | ConstantValueBinding<unknown>
      | DynamicValueBinding<unknown>
      | FactoryBinding<Factory<unknown>>
    ),
  ],
  instanceBinding: InstanceBinding<unknown>,
): PlanResult {
  const planServiceNode: PlanServiceNode = {
    bindings: [],
    isContextFree: true,
    serviceIdentifier: instanceBinding.serviceIdentifier,
  };

  const instanceBindingNode: InstanceBindingNode = {
    binding: instanceBinding,
    classMetadata: expect.any(Object) as unknown as ClassMetadata,
    constructorParams: [],
    propertyParams: new Map(),
  };

  const constructorParamServiceNode: PlanServiceNode = {
    bindings: [],
    isContextFree: true,
    serviceIdentifier: constructorParameterBinding.serviceIdentifier,
  };

  (constructorParamServiceNode as Writable<PlanServiceNode>).bindings = {
    binding: constructorParameterBinding,
  };

  instanceBindingNode.constructorParams.push(
    expect.objectContaining(constructorParamServiceNode) as PlanServiceNode,
  );

  const [propertyKey, propertyKeyBinding]: [
    string | symbol,
    (
      | ConstantValueBinding<unknown>
      | DynamicValueBinding<unknown>
      | FactoryBinding<Factory<unknown>>
    ),
  ] = propertyKeyBindingPair;

  const propertyServiceNode: PlanServiceNode = {
    bindings: [],
    isContextFree: true,
    serviceIdentifier: propertyKeyBinding.serviceIdentifier,
  };

  (propertyServiceNode as Writable<PlanServiceNode>).bindings = {
    binding: propertyKeyBinding,
  };

  instanceBindingNode.propertyParams.set(
    propertyKey,
    expect.objectContaining(propertyServiceNode) as PlanServiceNode,
  );

  (planServiceNode as Writable<PlanServiceNode>).bindings = instanceBindingNode;

  const planResult: PlanResult = {
    tree: {
      root: expect.objectContaining(planServiceNode),
    },
  };

  return planResult;
}

function buildSimpleResolvedValuePlanResult(
  parameterBinding:
    | ConstantValueBinding<unknown>
    | DynamicValueBinding<unknown>
    | FactoryBinding<Factory<unknown>>,
  resolvedValueBinding: ResolvedValueBinding<unknown>,
): PlanResult {
  const planServiceNode: PlanServiceNode = {
    bindings: [],
    isContextFree: true,
    serviceIdentifier: resolvedValueBinding.serviceIdentifier,
  };

  const instanceBindingNode: ResolvedValueBindingNode = {
    binding: resolvedValueBinding,
    params: [],
  };

  const constructorParamServiceNode: PlanServiceNode = {
    bindings: [],
    isContextFree: true,
    serviceIdentifier: parameterBinding.serviceIdentifier,
  };

  (constructorParamServiceNode as Writable<PlanServiceNode>).bindings = {
    binding: parameterBinding,
  };

  instanceBindingNode.params.push(
    expect.objectContaining(constructorParamServiceNode) as PlanServiceNode,
  );

  (planServiceNode as Writable<PlanServiceNode>).bindings = instanceBindingNode;

  const planResult: PlanResult = {
    tree: {
      root: expect.objectContaining(planServiceNode),
    },
  };

  return planResult;
}

function buildServiceRedirectionToLeafBindingPlanResult(
  leafBinding:
    | ConstantValueBinding<unknown>
    | DynamicValueBinding<unknown>
    | FactoryBinding<Factory<unknown>>,
  serviceRedirectionBinding: ServiceRedirectionBinding<unknown>,
): PlanResult {
  const planServiceNode: PlanServiceNode = {
    bindings: [],
    isContextFree: true,
    serviceIdentifier: serviceRedirectionBinding.serviceIdentifier,
  };

  const planResult: PlanResult = {
    tree: {
      root: expect.objectContaining(planServiceNode),
    },
  };

  const serviceRedirectionBindingNode: PlanServiceRedirectionBindingNode = {
    binding: serviceRedirectionBinding,
    redirections: [],
  };

  serviceRedirectionBindingNode.redirections.push({
    binding: leafBinding,
  });

  (planServiceNode as Writable<PlanServiceNode>).bindings =
    serviceRedirectionBindingNode;

  return planResult;
}

describe(plan, () => {
  let constantValueBinding: ConstantValueBinding<unknown>;
  let dynamicValueBinding: DynamicValueBinding<unknown>;
  let factoryBinding: FactoryBinding<Factory<unknown>>;
  let instanceBinding: InstanceBinding<unknown>;
  let resolvedValueBinding: ResolvedValueBinding<unknown>;
  let serviceRedirectionBinding: ServiceRedirectionBinding<unknown>;
  let serviceRedirectionToNonExistentBinding: ServiceRedirectionBinding<unknown>;

  let bindingService: BindingService;
  let getClassMetadataFunction: (type: Newable) => ClassMetadata;
  let planResultCacheService: PlanResultCacheService;

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

    bindingService = BindingService.build(() => undefined);

    bindingService.set(constantValueBinding);
    bindingService.set(dynamicValueBinding);
    bindingService.set(factoryBinding);
    bindingService.set(instanceBinding);
    bindingService.set(resolvedValueBinding);
    bindingService.set(serviceRedirectionBinding);
    bindingService.set(serviceRedirectionToNonExistentBinding);

    getClassMetadataFunction = (type: Newable): ClassMetadata =>
      getOwnReflectMetadata(type, classMetadataReflectKey) ??
      getDefaultClassMetadata();

    planResultCacheService = new PlanResultCacheService();
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
            rootConstraints: planParamsConstraint,
            servicesBranch: [],
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

Trying to resolve bindings for "${ServiceIds.serviceRedirectionToNonExistent} (Root service)".

- service redirections:
  - non-existent-service-id

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
              operations: {
                getBindings: bindingService.get.bind(bindingService),
                getBindingsChained:
                  bindingService.getChained.bind(bindingService),
                getClassMetadata: getClassMetadataFunction,
                getPlan: planResultCacheService.get.bind(
                  planResultCacheService,
                ),
                setBinding: bindingService.set.bind(bindingService),
                setNonCachedServiceNode:
                  planResultCacheService.setNonCachedServiceNode.bind(
                    planResultCacheService,
                  ),
                setPlan: planResultCacheService.set.bind(
                  planResultCacheService,
                ),
              },
              rootConstraints: planParamsConstraint,
              servicesBranch: [],
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
