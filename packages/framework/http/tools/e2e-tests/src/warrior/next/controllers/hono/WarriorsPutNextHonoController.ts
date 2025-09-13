import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Put,
} from '@inversifyjs/http-core';
import { Next as NextFn } from 'hono';

import { NextHonoMiddleware } from '../../middlewares/NextHonoMiddleware';

@Controller('/warriors')
export class WarriorsPutNextHonoController {
  @ApplyMiddleware({
    middleware: NextHonoMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Put()
  public async putWarrior(@Next() nextFn: NextFn): Promise<void> {
    await nextFn();
  }
}
