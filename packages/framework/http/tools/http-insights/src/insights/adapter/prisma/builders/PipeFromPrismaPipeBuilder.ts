import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Pipe as PrismaPipe } from '../../../../generated/prisma/client.js';
import { type Pipe } from '../../../domain/models/Pipe.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';

@injectable()
export class PipeFromPrismaPipeBuilder implements Builder<PrismaPipe, Pipe> {
  readonly #errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder;

  constructor(
    @inject(ErrorTracesFromPrismaJsonBuilder)
    errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder,
  ) {
    this.#errorTracesFromPrismaJsonBuilder = errorTracesFromPrismaJsonBuilder;
  }

  public build(input: PrismaPipe): Pipe {
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
      startedAt: input.started_at,
    };
  }
}
