import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { UnsuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/UnsuccessfulUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsDeleteUnsuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(UnsuccessfulUwebSocketsMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
