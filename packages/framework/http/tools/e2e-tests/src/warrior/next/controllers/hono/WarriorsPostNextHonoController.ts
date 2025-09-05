import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Post,
} from '@inversifyjs/http-core';
import { Next as NextFn } from 'hono';

import { NextHonoMiddleware } from '../../middlewares/NextHonoMiddleware';

@Controller('/warriors')
export class WarriorsPostNextHonoController {
  @ApplyMiddleware({
    middleware: NextHonoMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Post()
  public async putWarrior(@Next() nextFn: NextFn): Promise<void> {
    await nextFn();
  }
}
