import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/expressRoles.js';
import { RouteValueMetadataExpressMiddleware } from '../../middlewares/express/RouteValueMetadataExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsGetRouteValueMetadataExpressController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressMiddleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
