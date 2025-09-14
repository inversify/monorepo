import { Controller, Patch, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteFastifyInterceptor } from '../../interceptors/fastify/WarriorRouteFastifyInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteFastifyInterceptor)
export class WarriorsPatchFastifyInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
