import { Body, Controller, Patch } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchStringBodyController {
  @Patch()
  public async patchWarrior(@Body() body: string): Promise<string> {
    return body;
  }
}
