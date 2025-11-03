import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { SuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/SuccessfulUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsPutSuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(SuccessfulUwebSocketsMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
