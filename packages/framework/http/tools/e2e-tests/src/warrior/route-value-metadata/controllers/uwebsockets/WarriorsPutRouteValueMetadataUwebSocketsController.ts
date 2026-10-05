import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/uwebsocketsRoles.js';
import { RouteValueMetadataUwebSocketsMiddleware } from '../../middlewares/uwebsockets/RouteValueMetadataUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsPutRouteValueMetadataUwebSocketsController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataUwebSocketsMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
