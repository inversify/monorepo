import { Controller, Patch, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressInterceptor } from '../../interceptors/express/WarriorRouteExpressInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressInterceptor)
export class WarriorsPatchExpressInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
