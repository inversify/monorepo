import { Controller, Params, Put } from '@inversifyjs/http-core';

import { WarriorWithId } from '../models/WarriorWithId';

@Controller('/warriors')
export class WarriorsPutParamsNamedController {
  @Put('/:id')
  public async updateWarrior(
    @Params({
      name: 'id',
    })
    id: string,
  ): Promise<WarriorWithId> {
    return {
      damage: 10,
      health: 100,
      id,
      range: 1,
      speed: 10,
    };
  }
}
