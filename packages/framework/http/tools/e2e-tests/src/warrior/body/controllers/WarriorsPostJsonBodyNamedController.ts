import { Body, Controller, Post } from '@inversifyjs/http-core';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';

@Controller('/warriors')
export class WarriorsPostJsonBodyNamedController {
  @Post()
  public async createWarrior(
    @Body({
      name: 'name',
    })
    name: string,
  ): Promise<WarriorCreationResponse> {
    return {
      damage: 10,
      health: 100,
      name: name,
      range: 1,
      speed: 10,
      type: WarriorCreationResponseType.Melee,
    };
  }
}
