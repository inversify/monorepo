import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Post,
} from '@inversifyjs/http-core';
import { NextFunction } from 'express4';

import { NextExpress4Middleware } from '../../middlewares/NextExpress4Middleware';

@Controller('/warriors')
export class WarriorsPostNextExpress4Controller {
  @ApplyMiddleware({
    middleware: NextExpress4Middleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Post()
  public postWarrior(@Next() nextFn: NextFunction): void {
    nextFn();
  }
}
