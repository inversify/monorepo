import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Guard as PrismaGuard } from '../../../../generated/prisma/client.js';
import { type Guard } from '../../../domain/models/Guard.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';

@injectable()
export class GuardFromPrismaGuardBuilder implements Builder<
  PrismaGuard,
  Guard
> {
  readonly #errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder;

  constructor(
    @inject(ErrorTracesFromPrismaJsonBuilder)
    errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder,
  ) {
    this.#errorTracesFromPrismaJsonBuilder = errorTracesFromPrismaJsonBuilder;
  }

  public build(input: PrismaGuard): Guard {
    return {
      allowed: input.allowed,
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      guard: input.guard,
      id: input.id,
      startedAt: input.started_at,
    };
  }
}
