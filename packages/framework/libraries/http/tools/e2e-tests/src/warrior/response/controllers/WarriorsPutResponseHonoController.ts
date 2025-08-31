import { Controller, Put } from '@inversifyjs/http-core';
import { Context } from '@inversifyjs/http-hono';
import { Context as HonoContext } from 'hono';

@Controller('/warriors')
export class WarriorsPutResponseHonoController {
  @Put()
  public async putWarrior(@Context() context: HonoContext): Promise<Response> {
    return context.json({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
