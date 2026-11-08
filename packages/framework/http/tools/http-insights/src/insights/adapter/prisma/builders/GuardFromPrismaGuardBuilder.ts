import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Guard } from '../../../domain/models/Guard.js';
import { type Plan } from '../../../domain/models/Plan.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { PlanFromPrismaPlanBuilder } from './PlanFromPrismaPlanBuilder.js';
import { type PrismaGuardWithPlan } from './prismaPlanInclude.js';

@injectable()
export class GuardFromPrismaGuardBuilder implements Builder<
  PrismaGuardWithPlan,
  Guard
> {
  readonly #errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder;
  readonly #planFromPrismaPlanBuilder: PlanFromPrismaPlanBuilder;

  constructor(
    @inject(ErrorTracesFromPrismaJsonBuilder)
    errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder,
    @inject(PlanFromPrismaPlanBuilder)
    planFromPrismaPlanBuilder: PlanFromPrismaPlanBuilder,
  ) {
    this.#errorTracesFromPrismaJsonBuilder = errorTracesFromPrismaJsonBuilder;
    this.#planFromPrismaPlanBuilder = planFromPrismaPlanBuilder;
  }

  public build(input: PrismaGuardWithPlan): Guard {
    return {
      allowed: input.allowed,
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      guard: input.guard,
      id: input.id,
      plan: this.#readPlan(input.plan),
      startedAt: input.started_at,
    };
  }

  #readPlan(plan: PrismaGuardWithPlan['plan']): Plan | null {
    if (plan === null) {
      return null;
    }

    return this.#planFromPrismaPlanBuilder.build(plan);
  }
}
