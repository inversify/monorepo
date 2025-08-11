import { Controller, Head } from '@inversifyjs/http-core';

@Controller('/content')
export class ContentController {
  @Head()
  public async headContent(): Promise<undefined> {
    return undefined;
  }
}
