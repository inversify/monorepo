import {
  ApplyMiddleware,
  Controller,
  Get,
  MiddlewarePhase,
  Next,
} from '@inversifyjs/http-core';
import { NextFunction } from 'express';

import { NextExpressMiddleware } from '../../middlewares/NextExpressMiddleware';

@Controller('/warriors')
export class WarriorsGetNextExpressController {
  @ApplyMiddleware({
    middleware: NextExpressMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Get()
  public getWarrior(@Next() nextFn: NextFunction): void {
    nextFn();
  }
}
