import { MiddlewarePhase } from '@inversifyjs/http-core';
import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Middleware as PrismaMiddleware } from '../../../../generated/prisma/client.js';
import { type Middleware } from '../../../domain/models/Middleware.js';

@injectable()
export class MiddlewareFromPrismaMiddlewareBuilder implements Builder<
  PrismaMiddleware,
  Middleware
> {
  public build(input: PrismaMiddleware): Middleware {
    return {
      endedAt: input.ended_at,
      error: input.error,
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
