import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/uwebsocketsRoles.js';
import { RouteValueMetadataUwebSocketsMiddleware } from '../../middlewares/uwebsockets/RouteValueMetadataUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchRouteValueMetadataUwebSocketsController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataUwebSocketsMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
