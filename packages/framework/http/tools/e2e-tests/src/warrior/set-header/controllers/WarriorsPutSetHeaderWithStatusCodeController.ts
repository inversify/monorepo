import {
  Controller,
  HttpStatusCode,
  Put,
  SetHeader,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutSetHeaderWithStatusCodeController {
  @StatusCode(HttpStatusCode.ACCEPTED)
  @SetHeader('x-test-header', 'test-value')
  @Put()
  public async putWarrior(): Promise<void> {}
}
