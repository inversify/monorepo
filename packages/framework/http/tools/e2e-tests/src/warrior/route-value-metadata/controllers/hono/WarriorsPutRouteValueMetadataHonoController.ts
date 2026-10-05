import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/honoRoles.js';
import { RouteValueMetadataHonoMiddleware } from '../../middlewares/hono/RouteValueMetadataHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsPutRouteValueMetadataHonoController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataHonoMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
