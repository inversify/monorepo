import {
  Controller,
  HttpStatusCode,
  Post,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostStatusCodeController {
  @StatusCode(HttpStatusCode.NO_CONTENT)
  @Post()
  public async postWarrior(): Promise<void> {}
}
