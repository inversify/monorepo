import {
  Controller,
  Delete,
  HttpStatusCode,
  StatusCode,
} from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteStatusCodeController {
  @StatusCode(HttpStatusCode.NO_CONTENT)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
