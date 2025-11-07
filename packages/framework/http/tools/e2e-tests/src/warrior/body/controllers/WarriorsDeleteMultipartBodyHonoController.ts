import { Body, Controller, Delete } from '@inversifyjs/http-core';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';

@Controller('/warriors')
export class WarriorsDeleteMultipartBodyHonoController {
  @Delete()
  public async deleteWarrior(
    @Body() body: FormData,
  ): Promise<WarriorCreationResponse> {
    return {
      damage: 10,
      health: 100,
      name: body.get('name') as string,
      range: 1,
      speed: 10,
      type: body.get('type') as WarriorCreationResponseType,
    };
  }
}
