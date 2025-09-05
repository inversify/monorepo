import {
  Controller,
  HttpStatusCode,
  Put,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutStatusCodeController {
  @StatusCode(HttpStatusCode.NO_CONTENT)
  @Put()
  public async putWarrior(): Promise<void> {}
}
