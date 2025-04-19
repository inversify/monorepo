import { controller, DELETE, response } from '@inversifyjs/http-core';
import { FastifyReply } from 'fastify';

@controller('/warriors')
export class WarriorsDeleteResponseFastifyController {
  @DELETE()
  public async deleteWarrior(
    @response() response: FastifyReply,
  ): Promise<void> {
    response.send({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
