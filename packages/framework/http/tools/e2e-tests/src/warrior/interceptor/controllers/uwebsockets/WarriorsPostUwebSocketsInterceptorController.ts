import { Controller, Post, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteUwebSocketsInterceptor } from '../../interceptors/uwebsockets/WarriorRouteUwebSocketsInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteUwebSocketsInterceptor)
export class WarriorsPostUwebSocketsInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
