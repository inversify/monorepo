import { Controller, Delete, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteHonoInterceptor } from '../../interceptors/hono/WarriorRouteHonoInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteHonoInterceptor)
export class WarriorsDeleteHonoInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
