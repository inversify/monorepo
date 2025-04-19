import { controller, DELETE, response } from '@inversifyjs/http-core';
import { Response } from 'express';

@controller('/warriors')
export class WarriorsDeleteResponseExpressV4Controller {
  @DELETE()
  public async deleteWarrior(@response() response: Response): Promise<void> {
    response.send({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
