import { Controller, Put } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutExpressGlobalInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
