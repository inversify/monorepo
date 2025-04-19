import { controller, OPTIONS, response } from '@inversifyjs/http-core';
import { Response } from 'express';

@controller('/warriors')
export class WarriorsOptionsResponseExpressV4Controller {
  @OPTIONS()
  public async optionsWarrior(@response() response: Response): Promise<void> {
    response.send({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
