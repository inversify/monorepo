import { type Plan } from '../models/Plan.js';
import { type PlanBinding } from '../models/PlanBinding.js';
import { type PlanService } from '../models/PlanService.js';

export class PlanFixtures {
  public static get constantValue(): Plan {
    return {
      id: 'plan-id',
      root: {
        bindings: [
          {
            bindingId: 1,
            id: 'binding-id',
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
        id: 'service-id',
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
  }

  public static get cyclic(): Plan {
    const rootBindings: PlanBinding[] = [];
    const root: PlanService = {
      bindings: rootBindings,
      chained: true,
      id: 'root-service',
      isMultiple: true,
      name: {
        kind: 'number',
        value: '3',
      },
      optional: true,
      serviceIdentifier: {
        kind: 'symbol',
        value: 'Symbol(ninja)',
      },
      tags: [
        {
          key: {
            kind: 'string',
            value: 'kind',
          },
          value: 'sharp',
        },
        {
          key: {
            kind: 'symbol',
            value: 'Symbol(slot)',
          },
          value: null,
        },
      ],
    };
    const weapon: PlanService = {
      bindings: [
        {
          bindingId: 2,
          id: 'weapon-binding',
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
      id: 'weapon-service',
      isMultiple: false,
      name: null,
      optional: false,
      serviceIdentifier: {
        kind: 'string',
        value: 'Weapon',
      },
      tags: [],
    };
    const instance: PlanBinding = {
      bindingId: 4,
      constructorArguments: [weapon, null],
      id: 'root-binding',
      implementationType: {
        kind: 'class',
        value: 'Ninja',
      },
      moduleId: 0,
      properties: [
        {
          key: {
            kind: 'string',
            value: 'weapon',
          },
          service: weapon,
        },
        {
          key: {
            kind: 'symbol',
            value: 'Symbol(self)',
          },
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
    const leaf: PlanBinding = {
      bindingId: 5,
      id: 'leaf-binding',
      moduleId: null,
      scope: 'Singleton',
      serviceIdentifier: {
        kind: 'class',
        value: 'Shuriken',
      },
      type: 'Factory',
    };

    rootBindings.push(instance, leaf);

    return {
      id: 'cyclic-plan',
      root,
    };
  }
}
