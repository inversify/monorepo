import {
  Controller,
  Delete,
  HttpStatusCode,
  SetHeader,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteSetHeaderWithStatusCodeController {
  @StatusCode(HttpStatusCode.ACCEPTED)
  @SetHeader('x-test-header', 'test-value')
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
