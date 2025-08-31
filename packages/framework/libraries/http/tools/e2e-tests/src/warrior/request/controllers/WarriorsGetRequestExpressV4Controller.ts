import { Controller, Get, Request } from '@inversifyjs/http-core';
import { Request as ExpressRequest } from 'express4';

@Controller('/warriors')
export class WarriorsGetRequestExpressV4Controller {
  @Get()
  public async getWarrior(
    @Request() request: ExpressRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.headers['x-test-header'] as string,
    };
  }
}
