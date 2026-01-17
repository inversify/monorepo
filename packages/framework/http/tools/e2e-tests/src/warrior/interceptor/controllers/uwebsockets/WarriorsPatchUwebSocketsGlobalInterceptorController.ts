import { Controller, Patch } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchUwebSocketsGlobalInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
