import { Controller, Delete } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteExpressGlobalInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
