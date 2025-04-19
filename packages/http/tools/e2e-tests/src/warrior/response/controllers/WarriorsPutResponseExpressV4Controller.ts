import { controller, PUT, response } from '@inversifyjs/http-core';
import { Response } from 'express';

@controller('/warriors')
export class WarriorsPutResponseExpressV4Controller {
  @PUT()
  public async putWarrior(@response() response: Response): Promise<void> {
    response.send({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
