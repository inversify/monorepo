import { Controller, Headers, Patch } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchHeadersNamedController {
  @Patch()
  public async patchWarrior(
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
