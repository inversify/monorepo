import { Controller, Delete, Request } from '@inversifyjs/http-core';
import { HonoRequest } from 'hono';

@Controller('/warriors')
export class WarriorsDeleteRequestHonoController {
  @Delete()
  public async deleteWarrior(
    @Request() request: HonoRequest,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': request.header('x-test-header') as string,
    };
  }
}
