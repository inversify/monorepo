import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Patch,
} from '@inversifyjs/http-core';
import { type NextFunction } from 'express';

import { NextExpressMiddleware } from '../../middlewares/NextExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchNextExpressController {
  @ApplyMiddleware({
    middleware: NextExpressMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Patch()
  public patchWarrior(@Next() nextFn: NextFunction): void {
    nextFn();
  }
}
