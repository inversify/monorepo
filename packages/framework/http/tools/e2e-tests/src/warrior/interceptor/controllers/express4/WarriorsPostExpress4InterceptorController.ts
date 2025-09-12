import { Controller, Post, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressV4Interceptor } from '../../interceptors/express4/WarriorRouteExpressV4Interceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressV4Interceptor)
export class WarriorsPostExpress4InterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
