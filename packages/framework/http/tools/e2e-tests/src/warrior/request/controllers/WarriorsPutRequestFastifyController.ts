import { Controller, Put, Request } from '@inversifyjs/http-core';
import { type FastifyRequest } from 'fastify';

@Controller('/warriors')
export class WarriorsPutRequestFastifyController {
  @Put()
  public async updateWarrior(
    @Request() request: FastifyRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.headers['x-test-header'] as string,
    };
  }
}
