import { controller, DELETE, params } from '@inversifyjs/http-core';

import { WarriorWithId } from '../models/WarriorWithId';

@controller('/warriors')
export class WarriorsDeleteParamsNamedController {
  @DELETE('/:id')
  public async deleteWarrior(@params('id') id: string): Promise<WarriorWithId> {
    return {
      damage: 10,
      health: 100,
      id,
      range: 1,
      speed: 10,
    };
  }
}
