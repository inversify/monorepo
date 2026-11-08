import { beforeAll, describe, expect, it } from 'vitest';

import {
  Container,
  type Factory,
  type PlanInspection,
  type ResolutionContext,
} from 'inversify';

import { type Plan } from '../../../../insights/domain/models/Plan.js';
import { type PlanBinding } from '../../../../insights/domain/models/PlanBinding.js';
import { type PlanService } from '../../../../insights/domain/models/PlanService.js';
import { buildHttpInsightsPlan } from './buildHttpInsightsPlan.js';

function buildReadId(): () => string {
  let nextId: number = 0;

  return (): string => {
    nextId += 1;

    return `plan-node-${String(nextId)}`;
  };
}

describe(buildHttpInsightsPlan, () => {
  describe('having a constant value binding', () => {
    let bindingId: number;
    let container: Container;

    beforeAll(() => {
      container = new Container();
      bindingId = container
        .bind('Weapon')
        .toConstantValue('katana')
        .getIdentifier().id;
    });

    describe('when called', () => {
      let result: Plan;

      beforeAll(() => {
        result = buildHttpInsightsPlan(
          container.inspectCurrentPlan('Weapon'),
          buildReadId(),
        );
      });

      it('should return the constant value plan', () => {
        const expected: Plan = {
          id: 'plan-node-1',
          root: {
            bindings: [
              {
                bindingId,
                id: 'plan-node-3',
                moduleId: null,
                scope: 'Singleton',
                serviceIdentifier: {
                  kind: 'string',
                  value: 'Weapon',
                },
                type: 'ConstantValue',
              },
            ],
            chained: null,
            id: 'plan-node-2',
            isMultiple: false,
            name: null,
            optional: false,
            serviceIdentifier: {
              kind: 'string',
              value: 'Weapon',
            },
            tags: [],
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a dynamic value binding and a factory binding', () => {
    let dynamicValueBindingId: number;
    let factoryBindingId: number;
    let container: Container;

    beforeAll(() => {
      container = new Container();
      dynamicValueBindingId = container
        .bind('DynamicValue')
        .toDynamicValue(() => undefined)
        .getIdentifier().id;
      factoryBindingId = container
        .bind<Factory<unknown>>('Factory')
        .toFactory(
          (_context: ResolutionContext): Factory<unknown> =>
            () =>
              undefined,
        )
        .getIdentifier().id;
    });

    describe('when called', () => {
      let dynamicValueResult: Plan;
      let factoryResult: Plan;

      beforeAll(() => {
        dynamicValueResult = buildHttpInsightsPlan(
          container.inspectCurrentPlan('DynamicValue'),
          buildReadId(),
        );
        factoryResult = buildHttpInsightsPlan(
          container.inspectCurrentPlan('Factory'),
          buildReadId(),
        );
      });

      it('should keep the dynamic value scope', () => {
        expect(dynamicValueResult.root.bindings[0]).toStrictEqual({
          bindingId: dynamicValueBindingId,
          id: 'plan-node-3',
          moduleId: null,
          scope: 'Transient',
          serviceIdentifier: {
            kind: 'string',
            value: 'DynamicValue',
          },
          type: 'DynamicValue',
        });
      });

      it('should keep the factory scope', () => {
        expect(factoryResult.root.bindings[0]).toStrictEqual({
          bindingId: factoryBindingId,
          id: 'plan-node-3',
          moduleId: null,
          scope: 'Singleton',
          serviceIdentifier: {
            kind: 'string',
            value: 'Factory',
          },
          type: 'Factory',
        });
      });
    });
  });

  describe('having a resolved value with a single and a multiple argument', () => {
    let container: Container;
    let shieldBindingId: number;
    let warriorBindingId: number;
    let weaponBindingId: number;

    beforeAll(() => {
      container = new Container();
      weaponBindingId = container
        .bind('Weapon')
        .toConstantValue('katana')
        .getIdentifier().id;
      shieldBindingId = container
        .bind('Shield')
        .toConstantValue('buckler')
        .getIdentifier().id;
      warriorBindingId = container
        .bind('Warrior')
        .toResolvedValue(
          (_weapon: unknown, _shields: unknown[]): undefined => undefined,
          ['Weapon', { isMultiple: true, serviceIdentifier: 'Shield' }],
        )
        .getIdentifier().id;
    });

    describe('when called', () => {
      let result: Plan;

      beforeAll(() => {
        result = buildHttpInsightsPlan(
          container.inspectCurrentPlan('Warrior'),
          buildReadId(),
        );
      });

      it('should return the resolved value plan', () => {
        const shield: PlanService = {
          bindings: [
            {
              bindingId: shieldBindingId,
              id: 'plan-node-7',
              moduleId: null,
              scope: 'Singleton',
              serviceIdentifier: {
                kind: 'string',
                value: 'Shield',
              },
              type: 'ConstantValue',
            },
          ],
          chained: false,
          id: 'plan-node-6',
          isMultiple: true,
          name: null,
          optional: false,
          serviceIdentifier: {
            kind: 'string',
            value: 'Shield',
          },
          tags: [],
        };
        const weapon: PlanService = {
          bindings: [
            {
              bindingId: weaponBindingId,
              id: 'plan-node-5',
              moduleId: null,
              scope: 'Singleton',
              serviceIdentifier: {
                kind: 'string',
                value: 'Weapon',
              },
              type: 'ConstantValue',
            },
          ],
          chained: null,
          id: 'plan-node-4',
          isMultiple: false,
          name: null,
          optional: false,
          serviceIdentifier: {
            kind: 'string',
            value: 'Weapon',
          },
          tags: [],
        };
        const expected: Plan = {
          id: 'plan-node-1',
          root: {
            bindings: [
              {
                arguments: [weapon, shield],
                bindingId: warriorBindingId,
                id: 'plan-node-3',
                moduleId: null,
                scope: 'Transient',
                serviceIdentifier: {
                  kind: 'string',
                  value: 'Warrior',
                },
                type: 'ResolvedValue',
              },
            ],
            chained: null,
            id: 'plan-node-2',
            isMultiple: false,
            name: null,
            optional: false,
            serviceIdentifier: {
              kind: 'string',
              value: 'Warrior',
            },
            tags: [],
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a service redirection to a class', () => {
    class Katana {}

    let container: Container;
    let katanaBindingId: number;
    let redirectionBindingId: number;

    beforeAll(() => {
      container = new Container();
      katanaBindingId = container
        .bind(Katana)
        .toConstantValue(new Katana())
        .getIdentifier().id;
      container.bind('Weapon').toService(Katana);
    });

    describe('when called', () => {
      let result: Plan;

      beforeAll(() => {
        const inspection: PlanInspection =
          container.inspectCurrentPlan('Weapon');

        if (
          inspection.root.isMultiple ||
          inspection.root.binding === undefined
        ) {
          throw new Error('Expected a redirection binding.');
        }

        redirectionBindingId = inspection.root.binding.id;
        result = buildHttpInsightsPlan(inspection, buildReadId());
      });

      it('should return the redirection plan', () => {
        const katana: PlanService = {
          bindings: [
            {
              bindingId: katanaBindingId,
              id: 'plan-node-5',
              moduleId: null,
              scope: 'Singleton',
              serviceIdentifier: {
                kind: 'class',
                value: 'Katana',
              },
              type: 'ConstantValue',
            },
          ],
          chained: null,
          id: 'plan-node-4',
          isMultiple: false,
          name: null,
          optional: false,
          serviceIdentifier: {
            kind: 'class',
            value: 'Katana',
          },
          tags: [],
        };
        expect(result.root.bindings[0]).toStrictEqual({
          bindingId: redirectionBindingId,
          id: 'plan-node-3',
          moduleId: null,
          redirection: katana,
          serviceIdentifier: {
            kind: 'string',
            value: 'Weapon',
          },
          targetServiceIdentifier: {
            kind: 'class',
            value: 'Katana',
          },
          type: 'ServiceRedirection',
        });
      });
    });
  });

  describe('having a symbol service identifier', () => {
    const serviceIdentifier: symbol = Symbol('weapon');
    let container: Container;

    beforeAll(() => {
      container = new Container();
      container.bind(serviceIdentifier).toConstantValue(1);
    });

    describe('when called', () => {
      let result: Plan;

      beforeAll(() => {
        result = buildHttpInsightsPlan(
          container.inspectCurrentPlan(serviceIdentifier),
          buildReadId(),
        );
      });

      it('should stringify the symbol', () => {
        expect(result.root.serviceIdentifier).toStrictEqual({
          kind: 'symbol',
          value: 'Symbol(weapon)',
        });
      });
    });
  });

  describe('having request name, tag, and optional constraints', () => {
    const name: symbol = Symbol('melee');
    let container: Container;

    beforeAll(() => {
      container = new Container();
      container.bind('Weapon').toConstantValue('katana');
    });

    describe('when called', () => {
      let result: Plan;

      beforeAll(() => {
        result = buildHttpInsightsPlan(
          container.inspectCurrentPlan('Weapon', {
            name,
            optional: true,
            tag: {
              key: Symbol.for('slot'),
              value: 2,
            },
          }),
          buildReadId(),
        );
      });

      it('should keep the request constraints', () => {
        expect(result.root.name).toStrictEqual({
          kind: 'symbol',
          value: 'Symbol(melee)',
        });
        expect(result.root.optional).toBe(true);
        expect(result.root.tags).toStrictEqual([
          {
            key: {
              kind: 'symbol',
              value: 'Symbol(slot)',
            },
            value: 2,
          },
        ]);
      });
    });
  });

  describe('having multiple chained bindings', () => {
    let firstBindingId: number;
    let secondBindingId: number;
    let container: Container;

    beforeAll(() => {
      container = new Container();
      firstBindingId = container
        .bind('Weapon')
        .toConstantValue('katana')
        .getIdentifier().id;
      secondBindingId = container
        .bind('Weapon')
        .toConstantValue('shuriken')
        .getIdentifier().id;
    });

    describe('when called, with isMultiple true', () => {
      let result: Plan;

      beforeAll(() => {
        result = buildHttpInsightsPlan(
          container.inspectCurrentPlan('Weapon', {
            chained: true,
            isMultiple: true,
            name: 'melee',
            optional: true,
            tag: {
              key: 'kind',
              value: 'sharp',
            },
          }),
          buildReadId(),
        );
      });

      it('should return both bindings in order', () => {
        const expected: Plan = {
          id: 'plan-node-1',
          root: {
            bindings: [
              {
                bindingId: firstBindingId,
                id: 'plan-node-3',
                moduleId: null,
                scope: 'Singleton',
                serviceIdentifier: {
                  kind: 'string',
                  value: 'Weapon',
                },
                type: 'ConstantValue',
              },
              {
                bindingId: secondBindingId,
                id: 'plan-node-4',
                moduleId: null,
                scope: 'Singleton',
                serviceIdentifier: {
                  kind: 'string',
                  value: 'Weapon',
                },
                type: 'ConstantValue',
              },
            ],
            chained: true,
            id: 'plan-node-2',
            isMultiple: true,
            name: {
              kind: 'string',
              value: 'melee',
            },
            optional: true,
            serviceIdentifier: {
              kind: 'string',
              value: 'Weapon',
            },
            tags: [
              {
                key: {
                  kind: 'string',
                  value: 'kind',
                },
                value: 'sharp',
              },
            ],
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an optional service with no binding', () => {
    let container: Container;

    beforeAll(() => {
      container = new Container();
    });

    describe('when called', () => {
      let result: Plan;

      beforeAll(() => {
        result = buildHttpInsightsPlan(
          container.inspectCurrentPlan('Missing', { optional: true }),
          buildReadId(),
        );
      });

      it('should return a service with no bindings', () => {
        const expected: Plan = {
          id: 'plan-node-1',
          root: {
            bindings: [],
            chained: null,
            id: 'plan-node-2',
            isMultiple: false,
            name: null,
            optional: true,
            serviceIdentifier: {
              kind: 'string',
              value: 'Missing',
            },
            tags: [],
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an instance inspection with holes, properties, and tag values', () => {
    let result: Plan;

    beforeAll(() => {
      const circular: { self?: object } = {};

      circular.self = circular;

      const weapon = {
        binding: {
          id: 2,
          moduleId: undefined,
          scope: 'Singleton' as const,
          serviceIdentifier: 'Weapon',
          type: 'ConstantValue' as const,
        },
        isMultiple: false as const,
        name: Symbol.for('melee'),
        optional: false,
        serviceIdentifier: 'Weapon',
        tags: new Map(),
      };
      const root: {
        binding?: {
          constructorArguments: readonly [typeof weapon, undefined];
          id: number;
          implementationType: new () => object;
          moduleId: number;
          properties: ReadonlyMap<string | symbol, typeof weapon | object>;
          scope: 'Transient';
          serviceIdentifier: string;
          type: 'Instance';
        };
        isMultiple: false;
        name: undefined;
        optional: false;
        serviceIdentifier: string;
        tags: Map<string | symbol, unknown>;
      } = {
        isMultiple: false,
        name: undefined,
        optional: false,
        serviceIdentifier: 'Ninja',
        tags: new Map<string | symbol, unknown>([
          ['kind', 'sharp'],
          [Symbol.for('slot'), null],
          ['when', new Date('2026-01-01T00:00:00.000Z')],
          ['amount', 1n],
          ['skipped', Symbol('hidden')],
          ['fn', (): undefined => undefined],
          ['circular', circular],
          ['values', [1, 'a', null]],
        ]),
      };

      root.binding = {
        constructorArguments: [weapon, undefined],
        id: 4,
        implementationType: ((): new () => object => class {})(),
        moduleId: 0,
        properties: new Map<string | symbol, typeof weapon | object>([
          ['weapon', weapon],
          [Symbol.for('self'), root],
        ]),
        scope: 'Transient',
        serviceIdentifier: 'Ninja',
        type: 'Instance',
      };

      result = buildHttpInsightsPlan({ root } as PlanInspection, buildReadId());
    });

    describe('when called', () => {
      let selfService: PlanService | undefined;
      let sharedConstructor: PlanService | null | undefined;
      let sharedProperty: PlanService | undefined;

      beforeAll(() => {
        const binding: PlanBinding | undefined = result.root.bindings[0];

        if (binding === undefined || binding.type !== 'Instance') {
          throw new Error('Expected an instance binding.');
        }

        selfService = binding.properties[1]?.service;
        sharedConstructor = binding.constructorArguments[0];
        sharedProperty = binding.properties[0]?.service;
      });

      it('should preserve holes, sharing, and json tag values', () => {
        const weapon: PlanService = {
          bindings: [
            {
              bindingId: 2,
              id: 'plan-node-5',
              moduleId: null,
              scope: 'Singleton',
              serviceIdentifier: {
                kind: 'string',
                value: 'Weapon',
              },
              type: 'ConstantValue',
            },
          ],
          chained: null,
          id: 'plan-node-4',
          isMultiple: false,
          name: {
            kind: 'symbol',
            value: 'Symbol(melee)',
          },
          optional: false,
          serviceIdentifier: {
            kind: 'string',
            value: 'Weapon',
          },
          tags: [],
        };
        const rootBindings: PlanBinding[] = [];
        const root: PlanService = {
          bindings: rootBindings,
          chained: null,
          id: 'plan-node-2',
          isMultiple: false,
          name: null,
          optional: false,
          serviceIdentifier: {
            kind: 'string',
            value: 'Ninja',
          },
          tags: [
            {
              key: { kind: 'string', value: 'kind' },
              value: 'sharp',
            },
            {
              key: { kind: 'symbol', value: 'Symbol(slot)' },
              value: null,
            },
            {
              key: { kind: 'string', value: 'when' },
              value: '2026-01-01T00:00:00.000Z',
            },
            {
              key: { kind: 'string', value: 'amount' },
              value: '1',
            },
            {
              key: { kind: 'string', value: 'skipped' },
              value: null,
            },
            {
              key: { kind: 'string', value: 'fn' },
              value: null,
            },
            {
              key: { kind: 'string', value: 'circular' },
              value: { self: null },
            },
            {
              key: { kind: 'string', value: 'values' },
              value: [1, 'a', null],
            },
          ],
        };
        const instance: PlanBinding = {
          bindingId: 4,
          constructorArguments: [weapon, null],
          id: 'plan-node-3',
          implementationType: {
            kind: 'class',
            value: '(anonymous)',
          },
          moduleId: 0,
          properties: [
            {
              key: { kind: 'string', value: 'weapon' },
              service: weapon,
            },
            {
              key: { kind: 'symbol', value: 'Symbol(self)' },
              service: root,
            },
          ],
          scope: 'Transient',
          serviceIdentifier: {
            kind: 'string',
            value: 'Ninja',
          },
          type: 'Instance',
        };

        rootBindings.push(instance);

        expect(result).toStrictEqual({
          id: 'plan-node-1',
          root,
        });
        expect(selfService).toBe(result.root);
        expect(sharedConstructor).toBe(sharedProperty);
      });
    });
  });
});
