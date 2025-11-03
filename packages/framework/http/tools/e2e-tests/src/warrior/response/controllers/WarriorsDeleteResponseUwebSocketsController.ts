import { Controller, Delete, Response } from '@inversifyjs/http-core';
import { HttpResponse } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsDeleteResponseUwebSocketsController {
  @Delete()
  public async deleteWarrior(
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
