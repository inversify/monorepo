import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Patch,
} from '@inversifyjs/http-core';

import { NextFastifyMiddleware } from '../../middlewares/NextFastifyMiddleware';

@Controller('/warriors')
export class WarriorsPatchNextFastifyController {
  @ApplyMiddleware({
    middleware: NextFastifyMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Patch()
  public patchWarrior(@Next() doneFn: () => void): void {
    doneFn();
  }
}
