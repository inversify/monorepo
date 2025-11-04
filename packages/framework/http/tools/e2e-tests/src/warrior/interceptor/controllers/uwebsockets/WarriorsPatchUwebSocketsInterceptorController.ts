import { Controller, Patch, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteUwebSocketsInterceptor } from '../../interceptors/uwebsockets/WarriorRouteUwebSocketsInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteUwebSocketsInterceptor)
export class WarriorsPatchUwebSocketsInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
