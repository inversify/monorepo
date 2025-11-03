import {
  ApplyMiddleware,
  Controller,
  Delete,
  MiddlewarePhase,
  Next,
} from '@inversifyjs/http-core';

import { NextUwebSocketsMiddleware } from '../../middlewares/NextUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsDeleteNextUwebSocketsController {
  @ApplyMiddleware({
    middleware: NextUwebSocketsMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Delete()
  public deleteWarrior(@Next() nextFn: () => void): void {
    nextFn();
  }
}
