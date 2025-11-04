import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { UnsuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/UnsuccessfulUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsPutUnsuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(UnsuccessfulUwebSocketsMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
