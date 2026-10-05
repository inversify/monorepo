import { Controller, Patch, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteHonoInterceptor } from '../../interceptors/hono/WarriorRouteHonoInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteHonoInterceptor)
export class WarriorsPatchHonoInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
