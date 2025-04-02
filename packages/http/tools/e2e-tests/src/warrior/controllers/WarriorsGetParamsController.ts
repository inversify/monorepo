import { controller, GET, params } from '@inversifyjs/http-core';

import { WarriorWithId } from '../models/WarriorWithId';

@controller('/warriors')
export class WarriorsGetParamsController {
  @GET('/:id')
  public async getWarrior(
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
