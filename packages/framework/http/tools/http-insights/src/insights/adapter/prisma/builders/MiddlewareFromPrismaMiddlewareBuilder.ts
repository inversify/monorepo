import { MiddlewarePhase } from '@inversifyjs/http-core';
import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Middleware as PrismaMiddleware } from '../../../../generated/prisma/client.js';
import { type Middleware } from '../../../domain/models/Middleware.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';

@injectable()
export class MiddlewareFromPrismaMiddlewareBuilder implements Builder<
  PrismaMiddleware,
  Middleware
> {
  readonly #errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder;

  constructor(
    @inject(ErrorTracesFromPrismaJsonBuilder)
    errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder,
  ) {
    this.#errorTracesFromPrismaJsonBuilder = errorTracesFromPrismaJsonBuilder;
  }

  public build(input: PrismaMiddleware): Middleware {
    return {
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      id: input.id,
      middleware: input.middleware,
      phase: this.#readPhase(input.phase),
      startedAt: input.started_at,
    };
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
