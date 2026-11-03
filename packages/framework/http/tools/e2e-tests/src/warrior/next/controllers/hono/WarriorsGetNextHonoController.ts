import {
  ApplyMiddleware,
  Controller,
  Get,
  MiddlewarePhase,
  Next,
} from '@inversifyjs/http-core';
import { type Next as NextFn } from 'hono';

import { NextHonoMiddleware } from '../../middlewares/NextHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsGetNextHonoController {
  @ApplyMiddleware({
    middleware: NextHonoMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Get()
  public async getWarrior(@Next() nextFn: NextFn): Promise<void> {
    await nextFn();
  }
}
