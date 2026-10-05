import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/uwebsocketsRoles.js';
import { RouteValueMetadataUwebSocketsMiddleware } from '../../middlewares/uwebsockets/RouteValueMetadataUwebSocketsMiddleware.js';

@Controller('/warriors')
export class WarriorsOptionsRouteValueMetadataUwebSocketsController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataUwebSocketsMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
