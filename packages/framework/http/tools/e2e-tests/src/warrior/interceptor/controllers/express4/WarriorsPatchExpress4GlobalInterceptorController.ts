import { Controller, Patch } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchExpress4GlobalInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
