import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Put,
} from '@inversifyjs/http-core';

import { NextUwebSocketsMiddleware } from '../../middlewares/NextUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsPutNextUwebSocketsController {
  @ApplyMiddleware({
    middleware: NextUwebSocketsMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Put()
  public putWarrior(@Next() nextFn: () => void): void {
    nextFn();
  }
}
