import { Controller, Delete } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteHonoGlobalInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
