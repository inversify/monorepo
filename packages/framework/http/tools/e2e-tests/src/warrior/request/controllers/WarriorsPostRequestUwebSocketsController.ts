import { Controller, Post, Request } from '@inversifyjs/http-core';
import { HttpRequest } from 'uWebSockets.js';
@Controller('/warriors')
export class WarriorsPostRequestUwebSocketsController {
  @Post()
  public async createWarrior(
    @Request() request: HttpRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.getHeader('x-test-header'),
    };
  }
}
