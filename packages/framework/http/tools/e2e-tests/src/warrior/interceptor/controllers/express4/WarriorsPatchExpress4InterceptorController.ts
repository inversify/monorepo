import { Controller, Patch, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressV4Interceptor } from '../../interceptors/express4/WarriorRouteExpressV4Interceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressV4Interceptor)
export class WarriorsPatchExpress4InterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
