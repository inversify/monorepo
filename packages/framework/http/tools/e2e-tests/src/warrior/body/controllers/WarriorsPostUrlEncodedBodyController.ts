import { Body, Controller, Post } from '@inversifyjs/http-core';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse.js';
import { WarriorRequest } from '../models/WarriorRequest.js';

@Controller('/warriors')
export class WarriorsPostUrlEncodedBodyController {
  @Post()
  public async createWarrior(
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
