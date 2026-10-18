import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Guard as PrismaGuard } from '../../../../generated/prisma/client.js';
import { type Guard } from '../../../domain/models/Guard.js';

@injectable()
export class GuardFromPrismaGuardBuilder implements Builder<
  PrismaGuard,
  Guard
> {
  public build(input: PrismaGuard): Guard {
    return {
      allowed: input.allowed,
      endedAt: input.ended_at,
      error: input.error,
      guard: input.guard,
      id: input.id,
      startedAt: input.started_at,
    };
  }
}
