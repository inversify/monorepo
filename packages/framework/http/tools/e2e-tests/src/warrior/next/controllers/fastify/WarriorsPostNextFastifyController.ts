import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Post,
} from '@inversifyjs/http-core';
import { HookHandlerDoneFunction } from 'fastify';

import { NextFastifyMiddleware } from '../../middlewares/NextFastifyMiddleware';

@Controller('/warriors')
export class WarriorsPostNextFastifyController {
  @ApplyMiddleware({
    middleware: NextFastifyMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Post()
  public postWarrior(@Next() doneFn: HookHandlerDoneFunction): void {
    doneFn();
  }
}
