import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Patch,
} from '@inversifyjs/http-core';

import { NextUwebSocketsMiddleware } from '../../middlewares/NextUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchNextUwebSocketsController {
  @ApplyMiddleware({
    middleware: NextUwebSocketsMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Patch()
  public patchWarrior(@Next() nextFn: () => void): void {
    nextFn();
  }
}
