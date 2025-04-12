import { controller, PATCH, request } from '@inversifyjs/http-core';
import { FastifyRequest } from 'fastify';

@controller('/warriors')
export class WarriorsPatchRequestFastifyController {
  @PATCH()
  public async patchWarrior(
    @request() request: FastifyRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.headers['x-test-header'] as string,
    };
  }
}
