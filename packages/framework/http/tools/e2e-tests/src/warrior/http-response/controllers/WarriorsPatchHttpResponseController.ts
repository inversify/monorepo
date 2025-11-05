import {
  Controller,
  HttpResponse,
  NoContentHttpResponse,
  Patch,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchHttpResponseController {
  @Patch()
  public async patchWarrior(): Promise<HttpResponse> {
    return new NoContentHttpResponse({
      'x-test-header': 'test-value',
    });
  }
}
