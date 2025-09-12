import { Controller, Get, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteHonoInterceptor } from '../../interceptors/hono/WarriorRouteHonoInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteHonoInterceptor)
export class WarriorsGetHonoInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
