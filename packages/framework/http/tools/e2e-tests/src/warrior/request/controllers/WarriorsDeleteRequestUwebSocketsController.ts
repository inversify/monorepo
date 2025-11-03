import { Controller, Delete, Request } from '@inversifyjs/http-core';
import { HttpRequest } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsDeleteRequestUwebSocketsController {
  @Delete()
  public async deleteWarrior(
    @Request() request: HttpRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.getHeader('x-test-header'),
    };
  }
}
