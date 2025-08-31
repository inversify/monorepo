import { Controller, Get, Headers } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetHeadersController {
  @Get()
  public async getWarrior(
    @Headers() headers: Record<string, string>,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': headers['x-test-header'] as string,
    };
  }
}
