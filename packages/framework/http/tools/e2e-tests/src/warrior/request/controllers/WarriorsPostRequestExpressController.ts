import { Controller, Post, Request } from '@inversifyjs/http-core';
import { Request as ExpressRequest } from 'express';
@Controller('/warriors')
export class WarriorsPostRequestExpressController {
  @Post()
  public async createWarrior(
    @Request() request: ExpressRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.headers['x-test-header'] as string,
    };
  }
}
