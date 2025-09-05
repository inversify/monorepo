import { Controller, Delete, Response } from '@inversifyjs/http-core';
import { FastifyReply } from 'fastify';

@Controller('/warriors')
export class WarriorsDeleteResponseFastifyController {
  @Delete()
  public async deleteWarrior(
    @Response() response: FastifyReply,
  ): Promise<void> {
    response.send({
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    });
  }
}
