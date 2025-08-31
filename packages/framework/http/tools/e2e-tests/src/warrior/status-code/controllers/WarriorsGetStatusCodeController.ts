import {
  Controller,
  Get,
  HttpStatusCode,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetStatusCodeController {
  @StatusCode(HttpStatusCode.NO_CONTENT)
  @Get()
  public async getWarrior(): Promise<void> {}
}
