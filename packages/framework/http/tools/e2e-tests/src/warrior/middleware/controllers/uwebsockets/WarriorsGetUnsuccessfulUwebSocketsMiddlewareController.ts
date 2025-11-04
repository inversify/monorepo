import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { UnsuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/UnsuccessfulUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsGetUnsuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(UnsuccessfulUwebSocketsMiddleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
