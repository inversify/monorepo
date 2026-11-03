import { Controller, Delete } from '@inversifyjs/http-core';
import { Context } from '@inversifyjs/http-hono';
// oxlint-disable-next-line typescript/consistent-type-imports -- required by emitDecoratorMetadata
import { Context as HonoContext } from 'hono';

@Controller('/warriors')
export class WarriorsDeleteResponseHonoController {
  @Delete()
  public async deleteWarrior(
    @Context() context: HonoContext,
  ): Promise<Response> {
    return context.json({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
