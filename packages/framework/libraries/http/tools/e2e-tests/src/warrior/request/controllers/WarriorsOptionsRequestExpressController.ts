import { Controller, Options, Request } from '@inversifyjs/http-core';
import { Request as ExpressRequest } from 'express';

@Controller('/warriors')
export class WarriorsOptionsRequestExpressController {
  @Options()
  public async getWarrior(
    @Request() request: ExpressRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.headers['x-test-header'] as string,
    };
  }
}
