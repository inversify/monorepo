import {
  ApplyMiddleware,
  Controller,
  Get,
  MiddlewarePhase,
  Next,
} from '@inversifyjs/http-core';

import { NextFastifyMiddleware } from '../../middlewares/NextFastifyMiddleware';

@Controller('/warriors')
export class WarriorsGetNextFastifyController {
  @ApplyMiddleware({
    middleware: NextFastifyMiddleware,
    phase: MiddlewarePhase.PostHandler,
  })
  @Get()
  public getWarrior(@Next() doneFn: () => void): void {
    doneFn();
  }
}
