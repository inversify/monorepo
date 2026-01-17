import { Controller, Put } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutUwebSocketsGlobalInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
