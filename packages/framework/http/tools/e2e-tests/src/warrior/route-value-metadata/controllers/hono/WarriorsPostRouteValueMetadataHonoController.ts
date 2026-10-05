import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/honoRoles.js';
import { RouteValueMetadataHonoMiddleware } from '../../middlewares/hono/RouteValueMetadataHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsPostRouteValueMetadataHonoController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataHonoMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
