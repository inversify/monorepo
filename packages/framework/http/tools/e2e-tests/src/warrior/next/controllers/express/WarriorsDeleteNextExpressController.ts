import {
  ApplyMiddleware,
  Controller,
  Delete,
  MiddlewarePhase,
  Next,
} from '@inversifyjs/http-core';
import { NextFunction } from 'express';

import { NextExpressMiddleware } from '../../middlewares/NextExpressMiddleware';

@Controller('/warriors')
export class WarriorsDeleteNextExpressController {
  @ApplyMiddleware({
    middleware: NextExpressMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Delete()
  public deleteWarrior(@Next() nextFn: NextFunction): void {
    nextFn();
  }
}
