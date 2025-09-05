import {
  ApplyMiddleware,
  Controller,
  Delete,
  MiddlewarePhase,
  Next,
} from '@inversifyjs/http-core';
import { Next as NextFn } from 'hono';

import { NextHonoMiddleware } from '../../middlewares/NextHonoMiddleware';

@Controller('/warriors')
export class WarriorsDeleteNextHonoController {
  @ApplyMiddleware({
    middleware: NextHonoMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Delete()
  public async deleteWarrior(@Next() nextFn: NextFn): Promise<void> {
    await nextFn();
  }
}
