import {
  Controller,
  HttpStatusCode,
  Options,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsOptionsStatusCodeController {
  @StatusCode(HttpStatusCode.NO_CONTENT)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
