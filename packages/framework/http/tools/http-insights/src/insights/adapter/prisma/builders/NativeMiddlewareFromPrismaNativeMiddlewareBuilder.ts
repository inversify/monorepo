import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type NativeMiddleware as PrismaNativeMiddleware } from '../../../../generated/prisma/client.js';
import { type NativeMiddleware } from '../../../domain/models/NativeMiddleware.js';

@injectable()
export class NativeMiddlewareFromPrismaNativeMiddlewareBuilder implements Builder<
  PrismaNativeMiddleware,
  NativeMiddleware
> {
  public build(input: PrismaNativeMiddleware): NativeMiddleware {
    return {
      endedAt: input.ended_at,
      error: input.error,
      id: input.id,
      name: input.name,
      startedAt: input.started_at,
    };
  }
}
