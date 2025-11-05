import {
  Controller,
  HttpResponse,
  NoContentHttpResponse,
  Put,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutHttpResponseController {
  @Put()
  public async putWarrior(): Promise<HttpResponse> {
    return new NoContentHttpResponse({
      'x-test-header': 'test-value',
    });
  }
}
