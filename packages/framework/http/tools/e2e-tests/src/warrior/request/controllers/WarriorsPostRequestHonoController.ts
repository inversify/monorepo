import { Controller, Post, Request } from '@inversifyjs/http-core';
import { HonoRequest } from 'hono';

@Controller('/warriors')
export class WarriorsPostRequestHonoController {
  @Post()
  public async createWarrior(
    @Request() request: HonoRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.header('x-test-header') as string,
    };
  }
}
