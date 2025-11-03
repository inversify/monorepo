import { Controller, Options, Request } from '@inversifyjs/http-core';
import { HttpRequest } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsOptionsRequestUwebSocketsController {
  @Options()
  public async getWarrior(
    @Request() request: HttpRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.getHeader('x-test-header'),
    };
  }
}
