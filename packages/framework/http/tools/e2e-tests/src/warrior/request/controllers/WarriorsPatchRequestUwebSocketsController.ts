import { Controller, Patch, Request } from '@inversifyjs/http-core';
import { HttpRequest } from 'uWebSockets.js';

@Controller('/warriors')
export class WarriorsPatchRequestUwebSocketsController {
  @Patch()
  public async patchWarrior(
    @Request() request: HttpRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.getHeader('x-test-header'),
    };
  }
}
