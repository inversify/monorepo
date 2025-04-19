import { controller, PUT } from '@inversifyjs/http-core';
import { context } from '@inversifyjs/http-hono';
import { Context } from 'hono';

@controller('/warriors')
export class WarriorsPutResponseHonoController {
  @PUT()
  public async putWarrior(@context() context: Context): Promise<Response> {
    return context.json({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
