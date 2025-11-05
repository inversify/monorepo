import {
  Controller,
  Delete,
  HttpResponse,
  NoContentHttpResponse,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteHttpResponseController {
  @Delete()
  public async deleteWarrior(): Promise<HttpResponse> {
    return new NoContentHttpResponse({
      'x-test-header': 'test-value',
    });
  }
}
