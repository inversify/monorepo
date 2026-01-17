import { Controller, Put } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutExpress4GlobalInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
