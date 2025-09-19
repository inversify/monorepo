import { Controller, Get, Headers } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetHeadersNamedController {
  @Get()
  public async getWarrior(
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
