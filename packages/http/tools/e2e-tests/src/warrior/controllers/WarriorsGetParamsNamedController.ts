import { controller, GET, params } from '@inversifyjs/http-core';

import { WarriorWithId } from '../models/WarriorWithId';

@controller('/warriors')
export class WarriorsGetParamsNamedController {
  @GET('/:id')
  public async getWarrior(@params('id') id: string): Promise<WarriorWithId> {
    return {
      damage: 10,
      health: 100,
      id,
      range: 1,
      speed: 10,
    };
  }
}
