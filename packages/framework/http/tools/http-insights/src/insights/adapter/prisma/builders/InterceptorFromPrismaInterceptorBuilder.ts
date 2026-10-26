import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Interceptor as PrismaInterceptor } from '../../../../generated/prisma/client.js';
import { type Interceptor } from '../../../domain/models/Interceptor.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';

@injectable()
export class InterceptorFromPrismaInterceptorBuilder implements Builder<
  PrismaInterceptor,
  Interceptor
> {
  readonly #errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder;

  constructor(
    @inject(ErrorTracesFromPrismaJsonBuilder)
    errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder,
  ) {
    this.#errorTracesFromPrismaJsonBuilder = errorTracesFromPrismaJsonBuilder;
  }

  public build(input: PrismaInterceptor): Interceptor {
    return {
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      id: input.id,
      interceptor: input.interceptor,
      startedAt: input.started_at,
    };
  }
}
