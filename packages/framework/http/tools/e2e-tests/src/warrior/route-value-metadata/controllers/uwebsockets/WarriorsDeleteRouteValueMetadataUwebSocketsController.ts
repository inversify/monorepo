import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/uwebsocketsRoles.js';
import { RouteValueMetadataUwebSocketsMiddleware } from '../../middlewares/uwebsockets/RouteValueMetadataUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsDeleteRouteValueMetadataUwebSocketsController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataUwebSocketsMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
