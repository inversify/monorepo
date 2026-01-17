import { Controller, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostExpress4GlobalInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
