import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Response as PrismaResponse } from '../../../../generated/prisma/client.js';
import { type Response } from '../../../domain/models/Response.js';

@injectable()
export class ResponseFromPrismaResponseBuilder implements Builder<
  PrismaResponse,
  Response
> {
  public build(input: PrismaResponse): Response {
    return {
      aborted: input.aborted,
      headers: input.headers as unknown as Response['headers'],
      id: input.id,
      sentAt: input.sent_at,
      statusCode: input.status_code,
    };
  }
}
