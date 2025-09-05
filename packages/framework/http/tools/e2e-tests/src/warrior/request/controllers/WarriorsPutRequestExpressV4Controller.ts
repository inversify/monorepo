import { Controller, Put, Request } from '@inversifyjs/http-core';
import { Request as ExpressRequest } from 'express4';

@Controller('/warriors')
export class WarriorsPutRequestExpressV4Controller {
  @Put()
  public async updateWarrior(
    @Request() request: ExpressRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.headers['x-test-header'] as string,
    };
  }
}
