import { Controller, Get, Response } from '@inversifyjs/http-core';
import { HttpResponse } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsGetResponseUwebSocketsController {
  @Get()
  public async getWarrior(@Response() response: HttpResponse): Promise<void> {
    response.cork(() => {
      response.end(
        JSON.stringify({
          damage: 10,
          health: 100,
          range: 1,
          speed: 10,
        }),
      );
    });
  }
}
