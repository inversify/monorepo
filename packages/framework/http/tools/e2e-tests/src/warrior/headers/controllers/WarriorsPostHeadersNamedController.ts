import { Controller, Headers, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostHeadersNamedController {
  @Post()
  public async postWarrior(
    @Headers({
      name: 'x-test-header',
    })
    testHeader: string,
  ): Promise<Record<string, string>> {
    return {
      'x-test-header': testHeader,
    };
  }
}
