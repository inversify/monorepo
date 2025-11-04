import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { SuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/SuccessfulUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsOptionsSuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(SuccessfulUwebSocketsMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
