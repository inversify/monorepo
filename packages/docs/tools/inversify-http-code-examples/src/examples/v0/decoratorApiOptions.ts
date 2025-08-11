import { Controller, Options } from '@inversifyjs/http-core';

@Controller('/content')
export class ContentController {
  @Options()
  public async optionsContent(): Promise<undefined> {
    return undefined;
  }
}
