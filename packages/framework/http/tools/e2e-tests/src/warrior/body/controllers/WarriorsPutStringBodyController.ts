import { Body, Controller, Put } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutStringBodyController {
  @Put()
  public async putWarrior(@Body() body: string): Promise<string> {
    return body;
  }
}
