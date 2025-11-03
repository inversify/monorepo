import { Controller, Put, Response } from '@inversifyjs/http-core';
import { HttpResponse } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsPutResponseUwebSocketsController {
  @Put()
  public async putWarrior(@Response() response: HttpResponse): Promise<void> {
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
