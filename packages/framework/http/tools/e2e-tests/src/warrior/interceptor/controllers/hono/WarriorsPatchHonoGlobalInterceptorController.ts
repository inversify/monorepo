import { Controller, Patch } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchHonoGlobalInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
