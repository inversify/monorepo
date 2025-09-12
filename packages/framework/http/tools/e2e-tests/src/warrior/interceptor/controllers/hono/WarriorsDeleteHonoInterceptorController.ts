import { Controller, Delete, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteHonoInterceptor } from '../../interceptors/hono/WarriorRouteHonoInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteHonoInterceptor)
export class WarriorsDeleteHonoInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
