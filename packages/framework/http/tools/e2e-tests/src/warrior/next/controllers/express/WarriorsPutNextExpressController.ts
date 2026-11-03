import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Put,
} from '@inversifyjs/http-core';
import { type NextFunction } from 'express';

import { NextExpressMiddleware } from '../../middlewares/NextExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPutNextExpressController {
  @ApplyMiddleware({
    middleware: NextExpressMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Put()
  public putWarrior(@Next() nextFn: NextFunction): void {
    nextFn();
  }
}
