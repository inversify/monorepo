import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Patch,
} from '@inversifyjs/http-core';
import { NextFunction } from 'express4';

import { NextExpress4Middleware } from '../../middlewares/NextExpress4Middleware';

@Controller('/warriors')
export class WarriorsPatchNextExpress4Controller {
  @ApplyMiddleware({
    middleware: NextExpress4Middleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Patch()
  public patchWarrior(@Next() nextFn: NextFunction): void {
    nextFn();
  }
}
