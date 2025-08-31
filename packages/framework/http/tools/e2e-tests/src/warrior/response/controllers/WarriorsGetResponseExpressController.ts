import { Controller, Get, Response } from '@inversifyjs/http-core';
import { Response as ExpressResponse } from 'express';

@Controller('/warriors')
export class WarriorsGetResponseExpressController {
  @Get()
  public async getWarrior(
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
