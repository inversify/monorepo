import { beforeAll, describe, expect, it } from 'vitest';

import { ErrorTraceFixtures } from '../../../domain/fixtures/ErrorTraceFixtures.js';
import { type Controller } from '../../../domain/models/Controller.js';
import { PrismaControllerFixtures } from '../fixtures/PrismaControllerFixtures.js';
import { ControllerFromPrismaControllerBuilder } from './ControllerFromPrismaControllerBuilder.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { PlanFromPrismaPlanBuilder } from './PlanFromPrismaPlanBuilder.js';
import { type PrismaControllerWithPlan } from './prismaPlanInclude.js';

describe(ControllerFromPrismaControllerBuilder, () => {
  let controllerFromPrismaControllerBuilder: ControllerFromPrismaControllerBuilder;

  beforeAll(() => {
    controllerFromPrismaControllerBuilder =
      new ControllerFromPrismaControllerBuilder(
        new ErrorTracesFromPrismaJsonBuilder(),
        new PlanFromPrismaPlanBuilder(),
      );
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaControllerFixture: PrismaControllerWithPlan;

      let result: unknown;

      beforeAll(() => {
        prismaControllerFixture = PrismaControllerFixtures.any;

        result = controllerFromPrismaControllerBuilder.build(
          prismaControllerFixture,
        );
      });

      it('should return a Controller', () => {
        const expected: Controller = {
          controller: prismaControllerFixture.controller,
          endedAt: prismaControllerFixture.ended_at,
          error: prismaControllerFixture.error,
          errorTraces: [ErrorTraceFixtures.any],
          id: prismaControllerFixture.id,
          method: prismaControllerFixture.method,
          plan: null,
          startedAt: prismaControllerFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
