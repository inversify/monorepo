import { Controller, Patch, Request } from '@inversifyjs/http-core';
import { Request as ExpressRequest } from 'express4';

@Controller('/warriors')
export class WarriorsPatchRequestExpressV4Controller {
  @Patch()
  public async patchWarrior(
    @Request() request: ExpressRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.headers['x-test-header'] as string,
    };
  }
}
