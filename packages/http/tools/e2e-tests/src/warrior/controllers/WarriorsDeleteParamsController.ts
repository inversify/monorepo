import { controller, DELETE, params } from '@inversifyjs/http-core';

import { WarriorWithId } from '../models/WarriorWithId';

@controller('/warriors')
export class WarriorsDeleteParamsController {
  @DELETE('/:id')
  public async deleteWarrior(
    @params() params: { id: string },
  ): Promise<WarriorWithId> {
    return {
      damage: 10,
      health: 100,
      id: params.id,
      range: 1,
      speed: 10,
    };
  }
}
