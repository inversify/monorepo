import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/express4Roles.js';
import { RouteValueMetadataExpressV4Middleware } from '../../middlewares/express4/RouteValueMetadataExpressV4Middleware.js';

@Controller('/warriors')
export class WarriorsPutRouteValueMetadataExpressV4Controller {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressV4Middleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
