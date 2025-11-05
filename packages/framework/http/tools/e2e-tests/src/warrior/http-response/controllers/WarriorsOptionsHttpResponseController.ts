import {
  Controller,
  HttpResponse,
  NoContentHttpResponse,
  Options,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsOptionsHttpResponseController {
  @Options()
  public async optionsWarrior(): Promise<HttpResponse> {
    return new NoContentHttpResponse({
      'x-test-header': 'test-value',
    });
  }
}
