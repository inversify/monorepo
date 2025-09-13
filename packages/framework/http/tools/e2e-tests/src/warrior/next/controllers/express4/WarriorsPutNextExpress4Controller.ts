import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Put,
} from '@inversifyjs/http-core';
import { NextFunction } from 'express4';

import { NextExpress4Middleware } from '../../middlewares/NextExpress4Middleware';

@Controller('/warriors')
export class WarriorsPutNextExpress4Controller {
  @ApplyMiddleware({
    middleware: NextExpress4Middleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Put()
  public putWarrior(@Next() nextFn: NextFunction): void {
    nextFn();
  }
}
