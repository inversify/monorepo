import { Controller, Put } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutFastifyGlobalInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
