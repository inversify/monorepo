import { beforeAll, describe, expect, it } from 'vitest';

import { PlanFixtures } from '../fixtures/PlanFixtures.js';
import { type Plan } from '../models/Plan.js';
import { type PlanBinding } from '../models/PlanBinding.js';
import { definePlanJson } from './definePlanJson.js';

describe(definePlanJson, () => {
  describe('having a cyclic plan', () => {
    let planFixture: Plan;

    beforeAll(() => {
      planFixture = PlanFixtures.cyclic;
      definePlanJson(planFixture.root);

      for (const binding of planFixture.root.bindings) {
        definePlanServices(binding);
      }
    });

    describe('when serialized', () => {
      let constructorBindingCount: number;
      let first: unknown;
      let propertyWeapon: unknown;
      let rootId: string;
      let second: unknown;
      let self: unknown;
      let weaponId: string;

      beforeAll(() => {
        first = JSON.parse(JSON.stringify(planFixture));
        second = JSON.parse(JSON.stringify(planFixture));

        const serialized: SerializedPlan = readSerializedPlan(first);
        const instance: SerializedBinding | undefined =
          serialized.root.bindings[0];
        const constructorWeapon: SerializedService | null | undefined =
          instance?.constructorArguments?.[0];
        const constructorBindings: unknown = constructorWeapon?.bindings;

        if (
          instance === undefined ||
          constructorWeapon === null ||
          constructorWeapon === undefined ||
          !Array.isArray(constructorBindings) ||
          instance.properties?.[0] === undefined ||
          instance.properties[1] === undefined
        ) {
          throw new Error('Expected a serialized instance binding.');
        }

        constructorBindingCount = constructorBindings.length;
        propertyWeapon = instance.properties[0].service;
        rootId = serialized.root.id;
        self = instance.properties[1].service;
        weaponId = constructorWeapon.id;
      });

      it('should replace repeated services with their id', () => {
        expect(rootId).toBe('root-service');
        expect(weaponId).toBe('weapon-service');
        expect(constructorBindingCount).toBe(1);
        expect(propertyWeapon).toStrictEqual({
          id: 'weapon-service',
        });
        expect(self).toStrictEqual({
          id: 'root-service',
        });
        expect(second).toStrictEqual(first);
      });
    });
  });
});

interface SerializedService {
  readonly bindings?: unknown;
  readonly id: string;
}

interface SerializedBinding {
  readonly constructorArguments?: readonly (SerializedService | null)[];
  readonly properties?: readonly {
    readonly service: unknown;
  }[];
}

interface SerializedPlan {
  readonly root: {
    readonly bindings: readonly SerializedBinding[];
    readonly id: string;
  };
}

function readSerializedPlan(value: unknown): SerializedPlan {
  return value as SerializedPlan;
}

function definePlanServices(binding: PlanBinding): void {
  switch (binding.type) {
    case 'ConstantValue':
    case 'DynamicValue':
    case 'Factory':
      return;
    case 'Instance':
      for (const service of binding.constructorArguments) {
        if (service !== null) {
          definePlanJson(service);
        }
      }

      for (const property of binding.properties) {
        definePlanJson(property.service);
      }

      return;
    case 'ResolvedValue':
      for (const service of binding.arguments) {
        definePlanJson(service);
      }

      return;
    case 'ServiceRedirection':
      definePlanJson(binding.redirection);
  }
}
