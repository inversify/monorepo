import { Controller, Post, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteHonoInterceptor } from '../../interceptors/hono/WarriorRouteHonoInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteHonoInterceptor)
export class WarriorsPostHonoInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
