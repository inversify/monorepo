import { controller, GET, response } from '@inversifyjs/http-core';
import { FastifyReply } from 'fastify';

@controller('/warriors')
export class WarriorsGetResponseFastifyController {
  @GET()
  public async getWarrior(@response() response: FastifyReply): Promise<void> {
    response.send({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
