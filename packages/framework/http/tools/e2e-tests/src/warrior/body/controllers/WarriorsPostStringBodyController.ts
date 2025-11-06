import { Body, Controller, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostStringBodyController {
  @Post()
  public async createWarrior(@Body() body: string): Promise<string> {
    return body;
  }
}
