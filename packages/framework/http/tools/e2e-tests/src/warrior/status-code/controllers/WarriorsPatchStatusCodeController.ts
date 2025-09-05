import {
  Controller,
  HttpStatusCode,
  Patch,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchStatusCodeController {
  @StatusCode(HttpStatusCode.NO_CONTENT)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
