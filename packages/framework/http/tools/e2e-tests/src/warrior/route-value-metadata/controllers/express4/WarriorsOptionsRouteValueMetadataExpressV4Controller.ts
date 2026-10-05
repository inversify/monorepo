import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/express4Roles.js';
import { RouteValueMetadataExpressV4Middleware } from '../../middlewares/express4/RouteValueMetadataExpressV4Middleware.js';

@Controller('/warriors')
export class WarriorsOptionsRouteValueMetadataExpressV4Controller {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressV4Middleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
