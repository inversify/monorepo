import {
  Controller,
  Get,
  HttpResponse,
  NoContentHttpResponse,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetHttpResponseController {
  @Get()
  public async getWarrior(): Promise<HttpResponse> {
    return new NoContentHttpResponse({
      'x-test-header': 'test-value',
    });
  }
}
