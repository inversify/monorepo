import {
  ApplyMiddleware,
  Controller,
  MiddlewarePhase,
  Next,
  Options,
} from '@inversifyjs/http-core';

import { NextUwebSocketsMiddleware } from '../../middlewares/NextUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsOptionsNextUwebSocketsController {
  @ApplyMiddleware({
    middleware: NextUwebSocketsMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Options()
  public optionsWarrior(@Next() nextFn: () => void): void {
    nextFn();
  }
}
