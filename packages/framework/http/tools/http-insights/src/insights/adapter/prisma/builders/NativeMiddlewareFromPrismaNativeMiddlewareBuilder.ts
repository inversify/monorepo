import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type NativeMiddleware as PrismaNativeMiddleware } from '../../../../generated/prisma/client.js';
import { type NativeMiddleware } from '../../../domain/models/NativeMiddleware.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';

@injectable()
export class NativeMiddlewareFromPrismaNativeMiddlewareBuilder implements Builder<
  PrismaNativeMiddleware,
  NativeMiddleware
> {
  readonly #errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder;

  constructor(
    @inject(ErrorTracesFromPrismaJsonBuilder)
    errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder,
  ) {
    this.#errorTracesFromPrismaJsonBuilder = errorTracesFromPrismaJsonBuilder;
  }

  public build(input: PrismaNativeMiddleware): NativeMiddleware {
    return {
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      id: input.id,
      name: input.name,
      startedAt: input.started_at,
    };
  }
}
