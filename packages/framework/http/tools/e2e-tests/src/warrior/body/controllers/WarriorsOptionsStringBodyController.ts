import { Body, Controller, Options } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsOptionsStringBodyController {
  @Options()
  public async optionsWarrior(@Body() body: string): Promise<string> {
    return body;
  }
}
