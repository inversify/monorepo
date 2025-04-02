import { controller, params, PUT } from '@inversifyjs/http-core';

import { WarriorWithId } from '../models/WarriorWithId';

@controller('/warriors')
export class WarriorsPutParamsController {
  @PUT('/:id')
  public async updateWarrior(
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
