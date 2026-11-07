import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { type Newable, type ServiceIdentifier } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { BindingService } from '../../binding/services/BindingService.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { getDefaultClassMetadata } from '../../metadata/calculations/getDefaultClassMetadata.js';
import { inject } from '../../metadata/decorators/inject.js';
import { unmanaged } from '../../metadata/decorators/unmanaged.js';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { plan } from '../../planning/actions/plan.js';
import { type GetPlanOptions } from '../../planning/models/GetPlanOptions.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { LazyPlanServiceNode } from '../../planning/models/LazyPlanServiceNode.js';
import { type PlanParams } from '../../planning/models/PlanParams.js';
import { type PlanResult } from '../../planning/models/PlanResult.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { PlanResultCacheService } from '../../planning/services/PlanResultCacheService.js';
import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { type InstanceBindingInspection } from '../models/InstanceBindingInspection.js';
import { type PlanInspection } from '../models/PlanInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { type SingleBindingPlanServiceInspection } from '../models/SingleBindingPlanServiceInspection.js';
import { inspectPlan } from './inspectPlan.js';

const materialServiceId: ServiceIdentifier = Symbol.for('Material');

class Katana {
  @inject(materialServiceId)
  public readonly material!: unknown;

  constructor(
    @inject(materialServiceId)
    _material: unknown,
    @unmanaged()
    _unmanaged: unknown,
  ) {}
}

class Blade {
  constructor(
    @inject(materialServiceId)
    _material: unknown,
  ) {}
}

class Hilt {
  constructor(
    @inject(materialServiceId)
    _material: unknown,
  ) {}
}

class Sword {
  constructor(
    @inject(Blade)
    _blade: unknown,
    @inject(Hilt)
    _hilt: unknown,
  ) {}
}

function buildConstantValueBinding(
  id: number,
  serviceIdentifier: ServiceIdentifier,
): ConstantValueBinding<unknown> {
  return {
    cache: {
      isRight: false,
      value: undefined,
    },
    id,
    isSatisfiedBy: () => true,
    moduleId: undefined,
    onActivation: undefined,
    onDeactivation: undefined,
    scope: bindingScopeValues.Singleton,
    serviceIdentifier,
    type: bindingTypeValues.ConstantValue,
    value: Symbol(),
  };
}

function buildInstanceBinding(
  id: number,
  implementationType: Newable,
): InstanceBinding<unknown> {
  return {
    cache: {
      isRight: false,
      value: undefined,
    },
    id,
    implementationType,
    isSatisfiedBy: () => true,
    moduleId: undefined,
    onActivation: undefined,
    onDeactivation: undefined,
    scope: bindingScopeValues.Transient,
    serviceIdentifier: implementationType,
    type: bindingTypeValues.Instance,
  };
}

function buildPlanParams(
  bindingService: BindingService,
  serviceIdentifier: ServiceIdentifier,
): PlanParams {
  const planResultCacheService: PlanResultCacheService =
    new PlanResultCacheService(false);

  return {
    autobindOptions: undefined,
    jitEnabled: false,
    operations: {
      getActivations: () => undefined,
      getBindings: bindingService.get.bind(bindingService),
      getBindingsChained: bindingService.getChained.bind(bindingService),
      getClassMetadata: (type: Newable): ClassMetadata =>
        getOwnReflectMetadata(type, classMetadataReflectKey) ??
        getDefaultClassMetadata(),
      getPlan: planResultCacheService.get.bind(planResultCacheService),
      setBinding: bindingService.set.bind(bindingService),
      setNonCachedServiceNode:
        planResultCacheService.setNonCachedServiceNode.bind(
          planResultCacheService,
        ),
      setPlan: planResultCacheService.set.bind(planResultCacheService),
      subscribeActivationAddedOnce: () => undefined,
    },
    rootConstraints: {
      isMultiple: false,
      serviceIdentifier,
    },
    servicesBranch: [],
  };
}

function buildGetPlanOptions(
  serviceIdentifier: ServiceIdentifier,
): GetPlanOptions {
  return {
    isMultiple: false,
    name: undefined,
    optional: false,
    serviceIdentifier,
    tag: undefined,
  };
}

function getInstanceBindingInspection(
  serviceInspection: PlanServiceInspection | undefined,
): InstanceBindingInspection {
  return (serviceInspection as SingleBindingPlanServiceInspection)
    .binding as InstanceBindingInspection;
}

describe(inspectPlan, () => {
  describe('having a plan for an instance with managed and unmanaged constructor arguments and a property', () => {
    let materialBinding: ConstantValueBinding<unknown>;
    let katanaBinding: InstanceBinding<unknown>;
    let planResultFixture: PlanResult;

    beforeAll(() => {
      materialBinding = buildConstantValueBinding(1, materialServiceId);
      katanaBinding = buildInstanceBinding(2, Katana);

      const bindingService: BindingService = BindingService.build(
        () => undefined,
      );

      bindingService.set(materialBinding);
      bindingService.set(katanaBinding);

      planResultFixture = plan(buildPlanParams(bindingService, Katana));
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = inspectPlan(buildGetPlanOptions(Katana), planResultFixture);
      });

      it('should return a PlanInspection', () => {
        const materialInspection: PlanServiceInspection = {
          binding: {
            id: materialBinding.id,
            moduleId: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: materialServiceId,
            type: bindingTypeValues.ConstantValue,
          },
          isMultiple: false,
          name: undefined,
          optional: false,
          serviceIdentifier: materialServiceId,
          tags: new Map(),
        };

        const expected: PlanInspection = {
          root: {
            binding: {
              constructorArguments: [materialInspection, undefined],
              id: katanaBinding.id,
              implementationType: Katana,
              moduleId: undefined,
              properties: new Map([['material', materialInspection]]),
              scope: bindingScopeValues.Transient,
              serviceIdentifier: Katana,
              type: bindingTypeValues.Instance,
            },
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: Katana,
            tags: new Map(),
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a plan sharing a context free service node', () => {
    let planResultFixture: PlanResult;

    beforeAll(() => {
      const bindingService: BindingService = BindingService.build(
        () => undefined,
      );

      bindingService.set(buildConstantValueBinding(1, materialServiceId));
      bindingService.set(buildInstanceBinding(2, Blade));
      bindingService.set(buildInstanceBinding(3, Hilt));
      bindingService.set(buildInstanceBinding(4, Sword));

      planResultFixture = plan(buildPlanParams(bindingService, Sword));
    });

    describe('when called', () => {
      let result: PlanInspection;

      beforeAll(() => {
        result = inspectPlan(buildGetPlanOptions(Sword), planResultFixture);
      });

      it('should return the same PlanServiceInspection for the shared node', () => {
        const [bladeInspection, hiltInspection]: readonly (
          | PlanServiceInspection
          | undefined
        )[] = getInstanceBindingInspection(result.root).constructorArguments;

        expect(
          getInstanceBindingInspection(bladeInspection).constructorArguments[0],
        ).toBe(
          getInstanceBindingInspection(hiltInspection).constructorArguments[0],
        );
      });
    });
  });

  describe('having a plan whose service node is reachable from its own binding', () => {
    let planResultFixture: PlanResult;

    beforeAll(() => {
      const rootNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        resolve: () => undefined,
        serviceIdentifier: Blade,
      };

      const instanceBindingNode: InstanceBindingNode = {
        binding: buildInstanceBinding(1, Blade),
        classMetadata: {
          constructorArguments: [
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: Blade,
            },
          ],
          lifecycle: {
            postConstructMethodNames: new Set(),
            preDestroyMethodNames: new Set(),
          },
          properties: new Map(),
          scope: undefined,
        },
        constructorParams: [rootNode],
        propertyParams: new Map(),
        resolve: () => undefined,
      };

      rootNode.bindings = instanceBindingNode;

      planResultFixture = {
        tree: {
          root: rootNode,
        },
      };
    });

    describe('when called', () => {
      let result: PlanInspection;

      beforeAll(() => {
        result = inspectPlan(buildGetPlanOptions(Blade), planResultFixture);
      });

      it('should close the cycle on the ancestor PlanServiceInspection', () => {
        expect(
          getInstanceBindingInspection(result.root).constructorArguments[0],
        ).toBe(result.root);
      });
    });
  });

  describe('having a plan with an invalidated lazy service node', () => {
    let materialBinding: ConstantValueBinding<unknown>;
    let planResultFixture: PlanResult;

    beforeAll(() => {
      materialBinding = buildConstantValueBinding(1, materialServiceId);

      const bindingService: BindingService = BindingService.build(
        () => undefined,
      );

      bindingService.set(materialBinding);
      bindingService.set(buildInstanceBinding(2, Blade));

      planResultFixture = plan(buildPlanParams(bindingService, Blade));

      const materialNode: PlanServiceNode | undefined = (
        planResultFixture.tree.root.bindings as InstanceBindingNode
      ).constructorParams[0] as PlanServiceNode;

      if (!LazyPlanServiceNode.is(materialNode)) {
        throw new Error('Expected a lazy service node');
      }

      materialNode.invalidate();
    });

    describe('when called', () => {
      let result: PlanInspection;

      beforeAll(() => {
        result = inspectPlan(buildGetPlanOptions(Blade), planResultFixture);
      });

      it('should inspect the expanded service node', () => {
        const materialInspection: PlanServiceInspection | undefined =
          getInstanceBindingInspection(result.root).constructorArguments[0];

        expect(materialInspection).toStrictEqual(
          expect.objectContaining({
            binding: expect.objectContaining({
              id: materialBinding.id,
            }),
          }),
        );
      });
    });
  });

  describe('having a plan with a lazy service node that can no longer be planned', () => {
    let planResultFixture: PlanResult;

    beforeAll(() => {
      const materialBinding: ConstantValueBinding<unknown> =
        buildConstantValueBinding(1, materialServiceId);

      const bindingService: BindingService = BindingService.build(
        () => undefined,
      );

      bindingService.set(materialBinding);
      bindingService.set(buildInstanceBinding(2, Blade));

      planResultFixture = plan(buildPlanParams(bindingService, Blade));

      bindingService.removeById(materialBinding.id);

      const materialNode: PlanServiceNode | undefined = (
        planResultFixture.tree.root.bindings as InstanceBindingNode
      ).constructorParams[0] as PlanServiceNode;

      if (!LazyPlanServiceNode.is(materialNode)) {
        throw new Error('Expected a lazy service node');
      }

      materialNode.invalidate();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          inspectPlan(buildGetPlanOptions(Blade), planResultFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw a planning InversifyCoreError', () => {
        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining({
            kind: InversifyCoreErrorKind.planning,
          }),
        );
      });
    });
  });
});
