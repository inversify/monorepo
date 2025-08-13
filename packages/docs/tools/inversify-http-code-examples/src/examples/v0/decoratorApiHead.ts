import { Controller, Head, SetHeader } from '@inversifyjs/http-core';

@Controller('/content')
export class ContentController {
  @Head()
  @SetHeader('custom-content-header', 'sample')
  public async headContent(): Promise<undefined> {
    return undefined;
  }
}
