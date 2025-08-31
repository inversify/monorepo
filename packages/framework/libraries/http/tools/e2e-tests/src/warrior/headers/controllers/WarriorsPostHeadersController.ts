import { Controller, Headers, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostHeadersController {
  @Post()
  public async postWarrior(
    @Headers() headers: Record<string, string>,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': headers['x-test-header'] as string,
    };
  }
}
