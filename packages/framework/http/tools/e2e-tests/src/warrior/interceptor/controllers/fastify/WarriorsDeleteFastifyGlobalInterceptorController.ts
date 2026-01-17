import { Controller, Delete } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteFastifyGlobalInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
