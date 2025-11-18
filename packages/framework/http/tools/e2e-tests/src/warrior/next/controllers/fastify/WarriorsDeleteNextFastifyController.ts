import {
  ApplyMiddleware,
  Controller,
  Delete,
  MiddlewarePhase,
  Next,
} from '@inversifyjs/http-core';

import { NextFastifyMiddleware } from '../../middlewares/NextFastifyMiddleware';

@Controller('/warriors')
export class WarriorsDeleteNextFastifyController {
  @ApplyMiddleware({
    middleware: NextFastifyMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Delete()
  public deleteWarrior(@Next() doneFn: () => void): void {
    doneFn();
  }
}
