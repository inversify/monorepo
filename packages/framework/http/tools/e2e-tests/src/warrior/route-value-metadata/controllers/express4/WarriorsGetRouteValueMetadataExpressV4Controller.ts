import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/express4Roles.js';
import { RouteValueMetadataExpressV4Middleware } from '../../middlewares/express4/RouteValueMetadataExpressV4Middleware.js';

@Controller('/warriors')
export class WarriorsGetRouteValueMetadataExpressV4Controller {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressV4Middleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
