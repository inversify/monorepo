import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/expressRoles.js';
import { RouteValueMetadataExpressMiddleware } from '../../middlewares/express/RouteValueMetadataExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPostRouteValueMetadataExpressController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
