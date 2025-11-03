import { Controller, Get, Request } from '@inversifyjs/http-core';
import { HttpRequest } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsGetRequestUwebSocketsController {
  @Get()
  public async getWarrior(
    @Request() request: HttpRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.getHeader('x-test-header'),
    };
  }
}
