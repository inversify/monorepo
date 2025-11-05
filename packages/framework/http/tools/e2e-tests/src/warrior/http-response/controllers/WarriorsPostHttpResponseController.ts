import {
  Controller,
  HttpResponse,
  NoContentHttpResponse,
  Post,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostHttpResponseController {
  @Post()
  public async postWarrior(): Promise<HttpResponse> {
    return new NoContentHttpResponse({
      'x-test-header': 'test-value',
    });
  }
}
