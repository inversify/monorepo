import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { SuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/SuccessfulUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsGetSuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(SuccessfulUwebSocketsMiddleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
