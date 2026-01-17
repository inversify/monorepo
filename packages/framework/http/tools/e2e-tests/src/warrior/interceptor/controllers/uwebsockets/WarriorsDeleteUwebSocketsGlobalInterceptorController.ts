import { Controller, Delete } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteUwebSocketsGlobalInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
