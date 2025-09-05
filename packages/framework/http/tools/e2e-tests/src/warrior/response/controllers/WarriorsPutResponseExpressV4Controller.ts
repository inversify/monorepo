import { Controller, Put, Response } from '@inversifyjs/http-core';
import { Response as ExpressResponse } from 'express';
@Controller('/warriors')
export class WarriorsPutResponseExpressV4Controller {
  @Put()
  public async putWarrior(
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
