import { Controller, Delete, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteFastifyInterceptor } from '../../interceptors/fastify/WarriorRouteFastifyInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteFastifyInterceptor)
export class WarriorsDeleteFastifyInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
