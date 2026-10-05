import { Controller, Put, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteHonoInterceptor } from '../../interceptors/hono/WarriorRouteHonoInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteHonoInterceptor)
export class WarriorsPutHonoInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
