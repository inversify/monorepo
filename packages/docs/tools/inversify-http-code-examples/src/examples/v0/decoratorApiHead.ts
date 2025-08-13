import {
  Controller,
  Head,
  HttpStatusCode,
  SetHeader,
  StatusCode,
} from '@inversifyjs/http-core';

// Begin-example
@Controller('/content')
export class ContentController {
  @Head()
  @SetHeader('custom-content-header', 'sample')
  @StatusCode(HttpStatusCode.OK)
  public async headContent(): Promise<undefined> {
    return undefined;
  }
}
