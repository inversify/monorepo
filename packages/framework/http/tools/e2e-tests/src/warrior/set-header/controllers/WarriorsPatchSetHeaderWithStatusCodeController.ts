import {
  Controller,
  HttpStatusCode,
  Patch,
  SetHeader,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchSetHeaderWithStatusCodeController {
  @StatusCode(HttpStatusCode.ACCEPTED)
  @SetHeader('x-test-header', 'test-value')
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
