import { beforeAll, describe, expect, it } from 'vitest';

import { Prisma } from '../../../../generated/prisma/client.js';
import { PlanFixtures } from '../../../domain/fixtures/PlanFixtures.js';
import { type Plan } from '../../../domain/models/Plan.js';
import { type PlanBinding } from '../../../domain/models/PlanBinding.js';
import { type PlanService } from '../../../domain/models/PlanService.js';
import {
  type PlanOwner,
  type PlanRows,
  readPlanRows,
} from '../calculations/readPlanRows.js';
import { PlanFromPrismaPlanBuilder } from './PlanFromPrismaPlanBuilder.js';
import { type PrismaPlanWithGraph } from './prismaPlanInclude.js';

const createdAtFixture: Date = new Date('2026-01-01T00:00:00.000Z');

const ownerFixture: PlanOwner = {
  controllerId: 'controller-id',
  guardId: null,
  interceptorId: null,
  middlewareId: null,
  pipeId: null,
};

function readStoredJson(
  value: Prisma.InputJsonValue | typeof Prisma.JsonNull,
): Prisma.JsonValue {
  if (value === Prisma.JsonNull) {
    return null;
  }

  return value as Prisma.JsonValue;
}

function buildPrismaPlan(rows: PlanRows): PrismaPlanWithGraph {
  return {
    bindings: rows.bindings.map((binding) => ({
      ...binding,
      created_at: createdAtFixture,
      dependencies: rows.dependencies
        .filter((dependency) => dependency.binding_id === binding.id)
        .map((dependency) => ({
          ...dependency,
          created_at: createdAtFixture,
          updated_at: createdAtFixture,
        })),
      updated_at: createdAtFixture,
    })),
    controller_id: rows.plan.controller_id ?? null,
    created_at: createdAtFixture,
    guard_id: rows.plan.guard_id ?? null,
    id: rows.plan.id,
    interceptor_id: rows.plan.interceptor_id ?? null,
    middleware_id: rows.plan.middleware_id ?? null,
    pipe_id: rows.plan.pipe_id ?? null,
    services: rows.services.map((service) => ({
      ...service,
      created_at: createdAtFixture,
      incomingDependencies: [],
      serviceBindings: rows.serviceBindings.filter(
        (link) => link.service_id === service.id,
      ),
      tags: rows.tags
        .filter((tag) => tag.service_id === service.id)
        .map((tag) => ({
          ...tag,
          created_at: createdAtFixture,
          updated_at: createdAtFixture,
          value: readStoredJson(tag.value),
        })),
      updated_at: createdAtFixture,
    })),
    updated_at: createdAtFixture,
  } as PrismaPlanWithGraph;
}

describe(PlanFromPrismaPlanBuilder, () => {
  let planFromPrismaPlanBuilder: PlanFromPrismaPlanBuilder;

  beforeAll(() => {
    planFromPrismaPlanBuilder = new PlanFromPrismaPlanBuilder();
  });

  describe('.build', () => {
    describe('having a cyclic plan', () => {
      let planFixture: Plan;
      let prismaPlanFixture: PrismaPlanWithGraph;

      beforeAll(() => {
        planFixture = PlanFixtures.cyclic;
        prismaPlanFixture = buildPrismaPlan(
          readPlanRows(planFixture, ownerFixture, () => 'row'),
        );
      });

      describe('when called', () => {
        let result: Plan;
        let self: PlanService | undefined;

        beforeAll(() => {
          result = planFromPrismaPlanBuilder.build(prismaPlanFixture);
          const binding: PlanBinding | undefined = result.root.bindings[0];

          if (binding === undefined || binding.type !== 'Instance') {
            throw new Error('Expected an instance binding.');
          }

          self = binding.properties[1]?.service;
        });

        it('should return the plan', () => {
          expect(result).toStrictEqual(planFixture);
        });

        it('should reuse the root service for the property cycle', () => {
          expect(self).toBe(result.root);
        });
      });
    });

    describe('having an unknown binding type', () => {
      let bindingId: string;
      let prismaPlanFixture: PrismaPlanWithGraph;

      beforeAll(() => {
        const prismaPlan: PrismaPlanWithGraph = buildPrismaPlan(
          readPlanRows(PlanFixtures.constantValue, ownerFixture, () => 'row'),
        );
        const binding: PrismaPlanWithGraph['bindings'][number] | undefined =
          prismaPlan.bindings[0];

        if (binding === undefined) {
          throw new Error('Expected a binding.');
        }

        bindingId = binding.id;
        prismaPlanFixture = {
          ...prismaPlan,
          bindings: [
            {
              ...binding,
              type: 'Nope' as string as typeof binding.type,
            },
          ],
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            planFromPrismaPlanBuilder.build(prismaPlanFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(`Plan binding "${bindingId}" has unknown type "Nope".`),
          );
        });
      });
    });
  });
});
