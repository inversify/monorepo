import { controller, params, PATCH } from '@inversifyjs/http-core';

import { WarriorWithId } from '../models/WarriorWithId';

@controller('/warriors')
export class WarriorsPatchParamsController {
  @PATCH('/:id')
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
