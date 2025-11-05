import {
  Controller,
  HttpStatusCode,
  Options,
  SetHeader,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsOptionsSetHeaderWithStatusCodeController {
  @StatusCode(HttpStatusCode.ACCEPTED)
  @SetHeader('x-test-header', 'test-value')
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
