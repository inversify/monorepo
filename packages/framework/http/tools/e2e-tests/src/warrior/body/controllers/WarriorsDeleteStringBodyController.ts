import { Body, Controller, Delete } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteStringBodyController {
  @Delete()
  public async deleteWarrior(@Body() body: string): Promise<string> {
    return body;
  }
}
