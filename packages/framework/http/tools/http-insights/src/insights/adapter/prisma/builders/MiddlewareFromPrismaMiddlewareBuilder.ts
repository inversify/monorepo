import { MiddlewarePhase } from '@inversifyjs/http-core';
import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Middleware } from '../../../domain/models/Middleware.js';
import { type Plan } from '../../../domain/models/Plan.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { PlanFromPrismaPlanBuilder } from './PlanFromPrismaPlanBuilder.js';
import { type PrismaMiddlewareWithPlan } from './prismaPlanInclude.js';

@injectable()
export class MiddlewareFromPrismaMiddlewareBuilder implements Builder<
  PrismaMiddlewareWithPlan,
  Middleware
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

  public build(input: PrismaMiddlewareWithPlan): Middleware {
    return {
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      id: input.id,
      middleware: input.middleware,
      phase: this.#readPhase(input.phase),
      plan: this.#readPlan(input.plan),
      startedAt: input.started_at,
    };
  }

  #readPlan(plan: PrismaMiddlewareWithPlan['plan']): Plan | null {
    if (plan === null) {
      return null;
    }

    return this.#planFromPrismaPlanBuilder.build(plan);
  }

  #readPhase(phase: string): MiddlewarePhase {
    switch (phase) {
      case 'preHandler':
        return MiddlewarePhase.PreHandler;
      case 'postHandler':
        return MiddlewarePhase.PostHandler;
      default:
        throw new Error(`Unknown middleware phase "${phase}".`);
    }
  }
}
