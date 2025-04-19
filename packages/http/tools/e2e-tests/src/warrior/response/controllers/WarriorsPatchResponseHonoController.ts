import { controller, PATCH } from '@inversifyjs/http-core';
import { context } from '@inversifyjs/http-hono';
import { Context } from 'hono';

@controller('/warriors')
export class WarriorsPatchResponseHonoController {
  @PATCH()
  public async patchWarrior(@context() context: Context): Promise<Response> {
    return context.json({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
