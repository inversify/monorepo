import { inject, injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type HttpError as PrismaHttpError } from '../../../../generated/prisma/client.js';
import { type HttpError } from '../../../domain/models/HttpError.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';

@injectable()
export class HttpErrorFromPrismaHttpErrorBuilder implements Builder<
  PrismaHttpError,
  HttpError
> {
  readonly #errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder;

  constructor(
    @inject(ErrorTracesFromPrismaJsonBuilder)
    errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder,
  ) {
    this.#errorTracesFromPrismaJsonBuilder = errorTracesFromPrismaJsonBuilder;
  }

  public build(input: PrismaHttpError): HttpError {
    return {
      endedAt: input.ended_at,
      error: input.error,
      errorTraces: this.#errorTracesFromPrismaJsonBuilder.build(
        input.error_traces,
      ),
      filter: input.filter,
      id: input.id,
      startedAt: input.started_at,
    };
  }
}
