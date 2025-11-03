import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { UnsuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/UnsuccessfulUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsPostUnsuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(UnsuccessfulUwebSocketsMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
