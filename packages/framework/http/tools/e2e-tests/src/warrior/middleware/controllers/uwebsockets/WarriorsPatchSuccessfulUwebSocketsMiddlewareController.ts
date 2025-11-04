import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { SuccessfulUwebSocketsMiddleware } from '../../middlewares/uwebsockets/SuccessfulUwebSocketsMiddleware';

@Controller('/warriors')
export class WarriorsPatchSuccessfulUwebSocketsMiddlewareController {
  @ApplyMiddleware(SuccessfulUwebSocketsMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
