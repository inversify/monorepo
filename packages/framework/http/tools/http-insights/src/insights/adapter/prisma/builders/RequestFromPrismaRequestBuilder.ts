import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Request as PrismaRequest } from '../../../../generated/prisma/client.js';
import { type Request } from '../../../domain/models/Request.js';

@injectable()
export class RequestFromPrismaRequestBuilder implements Builder<
  PrismaRequest,
  Request
> {
  public build(input: PrismaRequest): Request {
    return {
      headers: input.headers as unknown as Request['headers'],
      id: input.id,
      method: input.method,
      startedAt: input.started_at,
      url: input.url,
    };
  }
}
