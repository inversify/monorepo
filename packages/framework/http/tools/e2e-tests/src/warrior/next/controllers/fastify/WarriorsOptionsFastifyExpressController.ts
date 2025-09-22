import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Options,
} from '@inversifyjs/http-core';
import { HookHandlerDoneFunction } from 'fastify';

import { NextFastifyMiddleware } from '../../middlewares/NextFastifyMiddleware';

@Controller('/warriors')
export class WarriorsOptionsNextFastifyController {
  @ApplyMiddleware({
    middleware: NextFastifyMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Options()
  public optionsWarrior(@Next() doneFn: HookHandlerDoneFunction): void {
    doneFn();
  }
}
