import { Controller, Patch } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchFastifyGlobalInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
