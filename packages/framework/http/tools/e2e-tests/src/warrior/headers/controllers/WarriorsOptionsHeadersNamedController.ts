import { Controller, Headers, Options } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsOptionsHeadersNamedController {
  @Options()
  public async optionsWarrior(
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
