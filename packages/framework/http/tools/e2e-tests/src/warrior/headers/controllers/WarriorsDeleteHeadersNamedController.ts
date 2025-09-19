import { Controller, Delete, Headers } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteHeadersNamedController {
  @Delete()
  public async deleteWarrior(
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
