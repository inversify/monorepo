import { Controller, Options, Response } from '@inversifyjs/http-core';
import { HttpResponse } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsOptionsResponseUwebSocketsController {
  @Options()
  public async optionsWarrior(
    @Response() response: HttpResponse,
  ): Promise<void> {
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
