import { Controller, Put } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutHonoGlobalInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
