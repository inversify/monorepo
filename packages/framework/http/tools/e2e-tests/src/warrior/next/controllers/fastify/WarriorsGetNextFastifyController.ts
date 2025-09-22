import {
  ApplyMiddleware,
  Controller,
  Get,
  MiddlewarePhase,
  Next,
} from '@inversifyjs/http-core';
import { HookHandlerDoneFunction } from 'fastify';

import { NextFastifyMiddleware } from '../../middlewares/NextFastifyMiddleware';

@Controller('/warriors')
export class WarriorsGetNextFastifyController {
  @ApplyMiddleware({
    middleware: NextFastifyMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Get()
  public getWarrior(@Next() doneFn: HookHandlerDoneFunction): void {
    doneFn();
  }
}
