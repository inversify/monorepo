import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Pipe } from '../../../domain/models/Pipe.js';
import { type Plan } from '../../../domain/models/Plan.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { PlanFromPrismaPlanBuilder } from './PlanFromPrismaPlanBuilder.js';
import { type PrismaPipeWithPlan } from './prismaPlanInclude.js';

@injectable()
export class PipeFromPrismaPipeBuilder implements Builder<
  PrismaPipeWithPlan,
  Pipe
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

  public build(input: PrismaPipeWithPlan): Pipe {
    return {
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      id: input.id,
      method: input.method,
      parameterIndex: input.parameter_index,
      pipe: input.pipe,
      plan: this.#readPlan(input.plan),
      startedAt: input.started_at,
    };
  }

  #readPlan(plan: PrismaPipeWithPlan['plan']): Plan | null {
    if (plan === null) {
      return null;
    }

    return this.#planFromPrismaPlanBuilder.build(plan);
  }
}
