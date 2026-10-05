import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { UnsuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/UnsuccessfulUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchUnsuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(UnsuccessfulUwebSocketsMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
