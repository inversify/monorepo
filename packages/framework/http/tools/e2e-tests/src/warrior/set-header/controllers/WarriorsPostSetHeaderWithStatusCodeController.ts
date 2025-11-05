import {
  Controller,
  HttpStatusCode,
  Post,
  SetHeader,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostSetHeaderWithStatusCodeController {
  @StatusCode(HttpStatusCode.ACCEPTED)
  @SetHeader('x-test-header', 'test-value')
  @Post()
  public async postWarrior(): Promise<void> {}
}
