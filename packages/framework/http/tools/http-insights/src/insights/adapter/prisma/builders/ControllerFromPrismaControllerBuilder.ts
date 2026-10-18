import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Controller as PrismaController } from '../../../../generated/prisma/client.js';
import { type Controller } from '../../../domain/models/Controller.js';

@injectable()
export class ControllerFromPrismaControllerBuilder implements Builder<
  PrismaController,
  Controller
> {
  public build(input: PrismaController): Controller {
    return {
      controller: input.controller,
      endedAt: input.ended_at,
      error: input.error,
      id: input.id,
      method: input.method,
      startedAt: input.started_at,
    };
  }
}
