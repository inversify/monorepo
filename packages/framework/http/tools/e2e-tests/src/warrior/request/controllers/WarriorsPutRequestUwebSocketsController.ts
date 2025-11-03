import { Controller, Put, Request } from '@inversifyjs/http-core';
import { HttpRequest } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsPutRequestUwebSocketsController {
  @Put()
  public async updateWarrior(
    @Request() request: HttpRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.getHeader('x-test-header'),
    };
  }
}
