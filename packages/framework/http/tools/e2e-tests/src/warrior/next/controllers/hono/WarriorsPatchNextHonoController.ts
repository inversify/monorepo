import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Patch,
} from '@inversifyjs/http-core';
import { Next as NextFn } from 'hono';

import { NextHonoMiddleware } from '../../middlewares/NextHonoMiddleware';

@Controller('/warriors')
export class WarriorsPatchNextHonoController {
  @ApplyMiddleware({
    middleware: NextHonoMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Patch()
  public async patchWarrior(@Next() nextFn: NextFn): Promise<void> {
    await nextFn();
  }
}
