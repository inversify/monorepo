import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Put,
} from '@inversifyjs/http-core';

import { NextFastifyMiddleware } from '../../middlewares/NextFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsPutNextFastifyController {
  @ApplyMiddleware({
    middleware: NextFastifyMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Put()
  public putWarrior(@Next() doneFn: () => void): void {
    doneFn();
  }
}
