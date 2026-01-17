import { Controller, Delete } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteExpress4GlobalInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
