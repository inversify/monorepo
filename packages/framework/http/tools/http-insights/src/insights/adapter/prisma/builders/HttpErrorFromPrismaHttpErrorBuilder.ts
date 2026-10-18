import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type HttpError as PrismaHttpError } from '../../../../generated/prisma/client.js';
import { type HttpError } from '../../../domain/models/HttpError.js';

@injectable()
export class HttpErrorFromPrismaHttpErrorBuilder implements Builder<
  PrismaHttpError,
  HttpError
> {
  public build(input: PrismaHttpError): HttpError {
    return {
      endedAt: input.ended_at,
      error: input.error,
      filter: input.filter,
      id: input.id,
      startedAt: input.started_at,
    };
  }
}
