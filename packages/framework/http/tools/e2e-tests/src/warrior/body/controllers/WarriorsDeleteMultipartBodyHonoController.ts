import { Body, Controller, Delete } from '@inversifyjs/http-core';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse.js';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType.js';

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
      type: body.get('type') as WarriorCreationResponseType,
    };
  }
}
