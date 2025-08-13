import { Controller, Head, SetHeader } from '@inversifyjs/http-core';

// Begin-example
@Controller('/content')
export class ContentController {
  @Head()
  @SetHeader('custom-content-header', 'sample')
  public async headContent(): Promise<undefined> {
    return undefined;
  }
}
