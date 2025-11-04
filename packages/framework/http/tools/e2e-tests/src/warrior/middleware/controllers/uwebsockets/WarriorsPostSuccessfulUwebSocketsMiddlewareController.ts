import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { SuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/SuccessfulUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsPostSuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(SuccessfulUwebSocketsMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
