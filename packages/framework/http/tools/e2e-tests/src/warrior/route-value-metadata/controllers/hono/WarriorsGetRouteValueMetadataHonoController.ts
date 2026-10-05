import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/honoRoles.js';
import { RouteValueMetadataHonoMiddleware } from '../../middlewares/hono/RouteValueMetadataHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsGetRouteValueMetadataHonoController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataHonoMiddleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
