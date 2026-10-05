import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { UnsuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/UnsuccessfulUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsOptionsUnsuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(UnsuccessfulUwebSocketsMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
