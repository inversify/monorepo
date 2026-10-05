import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/uwebsocketsRoles.js';
import { RouteValueMetadataUwebSocketsMiddleware } from '../../middlewares/uwebsockets/RouteValueMetadataUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsPostRouteValueMetadataUwebSocketsController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataUwebSocketsMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
