import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Interceptor } from '../../../domain/models/Interceptor.js';
import { type Plan } from '../../../domain/models/Plan.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { PlanFromPrismaPlanBuilder } from './PlanFromPrismaPlanBuilder.js';
import { type PrismaInterceptorWithPlan } from './prismaPlanInclude.js';

@injectable()
export class InterceptorFromPrismaInterceptorBuilder implements Builder<
  PrismaInterceptorWithPlan,
  Interceptor
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

  public build(input: PrismaInterceptorWithPlan): Interceptor {
    return {
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      id: input.id,
      interceptor: input.interceptor,
      plan: this.#readPlan(input.plan),
      startedAt: input.started_at,
    };
  }

  #readPlan(plan: PrismaInterceptorWithPlan['plan']): Plan | null {
    if (plan === null) {
      return null;
    }

    return this.#planFromPrismaPlanBuilder.build(plan);
  }
}
