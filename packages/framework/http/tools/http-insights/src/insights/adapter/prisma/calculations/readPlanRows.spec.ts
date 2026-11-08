import { beforeAll, describe, expect, it } from 'vitest';

import { Prisma } from '../../../../generated/prisma/client.js';
import { PlanFixtures } from '../../../domain/fixtures/PlanFixtures.js';
import { type Plan } from '../../../domain/models/Plan.js';
import { type PlanOwner, type PlanRows, readPlanRows } from './readPlanRows.js';

const ownerFixture: PlanOwner = {
  controllerId: 'controller-id',
  guardId: null,
  interceptorId: null,
  middlewareId: null,
  pipeId: null,
};

function buildReadId(): () => string {
  let nextId: number = 0;

  return (): string => {
    nextId += 1;

    return `row-${String(nextId)}`;
  };
}

describe(readPlanRows, () => {
  describe('having a constant value plan', () => {
    let planFixture: Plan;

    beforeAll(() => {
      planFixture = PlanFixtures.constantValue;
    });

    describe('when called', () => {
      let result: PlanRows;

      beforeAll(() => {
        result = readPlanRows(planFixture, ownerFixture, buildReadId());
      });

      it('should return one service and one binding', () => {
        const expected: PlanRows = {
          bindings: [
            {
              binding_identifier: 1,
              id: 'binding-id',
              implementation_type_kind: null,
              implementation_type_value: null,
              module_id: null,
              plan_id: 'plan-id',
              scope: 'Singleton',
              service_identifier_kind: 'string',
              service_identifier_value: 'Weapon',
              target_service_identifier_kind: null,
              target_service_identifier_value: null,
              type: 'ConstantValue',
            },
          ],
          dependencies: [],
          plan: {
            controller_id: 'controller-id',
            guard_id: null,
            id: 'plan-id',
            interceptor_id: null,
            middleware_id: null,
            pipe_id: null,
          },
          serviceBindings: [
            {
              binding_id: 'binding-id',
              position: 0,
              service_id: 'service-id',
            },
          ],
          services: [
            {
              chained: null,
              id: 'service-id',
              is_multiple: false,
              is_root: true,
              name_kind: null,
              name_value: null,
              optional: false,
              plan_id: 'plan-id',
              service_identifier_kind: 'string',
              service_identifier_value: 'Weapon',
            },
          ],
          tags: [],
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a cyclic plan', () => {
    let planFixture: Plan;

    beforeAll(() => {
      planFixture = PlanFixtures.cyclic;
    });

    describe('when called', () => {
      let result: PlanRows;

      beforeAll(() => {
        result = readPlanRows(planFixture, ownerFixture, buildReadId());
      });

      it('should return each service once and keep constructor holes', () => {
        expect(result.services.map((service) => service.id)).toStrictEqual([
          'root-service',
          'weapon-service',
        ]);
        expect(result.bindings.map((binding) => binding.id)).toStrictEqual([
          'root-binding',
          'weapon-binding',
          'leaf-binding',
        ]);
        expect(result.tags).toStrictEqual([
          {
            id: 'row-1',
            key_kind: 'string',
            key_value: 'kind',
            position: 0,
            service_id: 'root-service',
            value: 'sharp',
          },
          {
            id: 'row-2',
            key_kind: 'symbol',
            key_value: 'Symbol(slot)',
            position: 1,
            service_id: 'root-service',
            value: Prisma.JsonNull,
          },
        ]);
        expect(result.dependencies).toStrictEqual([
          {
            binding_id: 'root-binding',
            id: 'row-3',
            key_kind: null,
            key_value: null,
            kind: 'constructorArgument',
            position: 0,
            service_id: 'weapon-service',
          },
          {
            binding_id: 'root-binding',
            id: 'row-4',
            key_kind: null,
            key_value: null,
            kind: 'constructorArgument',
            position: 1,
            service_id: null,
          },
          {
            binding_id: 'root-binding',
            id: 'row-5',
            key_kind: 'string',
            key_value: 'weapon',
            kind: 'property',
            position: 0,
            service_id: 'weapon-service',
          },
          {
            binding_id: 'root-binding',
            id: 'row-6',
            key_kind: 'symbol',
            key_value: 'Symbol(self)',
            kind: 'property',
            position: 1,
            service_id: 'root-service',
          },
        ]);
        expect(
          result.bindings.find((binding) => binding.id === 'root-binding'),
        ).toStrictEqual(
          expect.objectContaining({
            implementation_type_kind: 'class',
            implementation_type_value: 'Ninja',
            module_id: 0,
            scope: 'Transient',
            type: 'Instance',
          }),
        );
        expect(result.services[0]).toStrictEqual(
          expect.objectContaining({
            chained: true,
            is_multiple: true,
            is_root: true,
            name_kind: 'number',
            name_value: '3',
            service_identifier_kind: 'symbol',
            service_identifier_value: 'Symbol(ninja)',
          }),
        );
      });
    });
  });
});
