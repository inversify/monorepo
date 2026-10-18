import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Interceptor as PrismaInterceptor } from '../../../../generated/prisma/client.js';
import { type Interceptor } from '../../../domain/models/Interceptor.js';

@injectable()
export class InterceptorFromPrismaInterceptorBuilder implements Builder<
  PrismaInterceptor,
  Interceptor
> {
  public build(input: PrismaInterceptor): Interceptor {
    return {
      endedAt: input.ended_at,
      error: input.error,
      id: input.id,
      interceptor: input.interceptor,
      startedAt: input.started_at,
    };
  }
}
