import { Controller, Post, Response } from '@inversifyjs/http-core';
import { type Response as ExpressResponse } from 'express';

@Controller('/warriors')
export class WarriorsPostResponseExpressController {
  @Post()
  public async postWarrior(
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
