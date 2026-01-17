import { Controller, Patch } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchExpressGlobalInterceptorController {
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
