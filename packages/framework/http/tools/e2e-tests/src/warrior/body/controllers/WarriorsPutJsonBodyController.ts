import { Body, Controller, Put } from '@inversifyjs/http-core';

import { type WarriorCreationResponse } from '../models/WarriorCreationResponse.js';
import { type WarriorRequest } from '../models/WarriorRequest.js';

@Controller('/warriors')
export class WarriorsPutJsonBodyController {
  @Put()
  public async updateWarrior(
    @Body() body: WarriorRequest,
  ): Promise<WarriorCreationResponse> {
    return {
      damage: 10,
      health: 100,
      name: body.name,
      range: 1,
      speed: 10,
      type: body.type,
    };
  }
}
