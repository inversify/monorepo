import { Controller, Options, Response } from '@inversifyjs/http-core';
import { Response as ExpressResponse } from 'express';

@Controller('/warriors')
export class WarriorsOptionsResponseExpressController {
  @Options()
  public async optionsWarrior(
    @Response() response: ExpressResponse,
  ): Promise<void> {
    response.send({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
