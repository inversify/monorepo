import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Controller } from '../../../domain/models/Controller.js';
import { type Plan } from '../../../domain/models/Plan.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { PlanFromPrismaPlanBuilder } from './PlanFromPrismaPlanBuilder.js';
import { type PrismaControllerWithPlan } from './prismaPlanInclude.js';

@injectable()
export class ControllerFromPrismaControllerBuilder implements Builder<
  PrismaControllerWithPlan,
  Controller
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

  public build(input: PrismaControllerWithPlan): Controller {
    return {
      controller: input.controller,
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      id: input.id,
      method: input.method,
      plan: this.#readPlan(input.plan),
      startedAt: input.started_at,
    };
  }

  #readPlan(plan: PrismaControllerWithPlan['plan']): Plan | null {
    if (plan === null) {
      return null;
    }

    return this.#planFromPrismaPlanBuilder.build(plan);
  }
}
