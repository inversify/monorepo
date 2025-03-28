import { controller, GET } from '@inversifyjs/http-core';

@controller()
export class AppController {
  @GET()
  public ok(): string {
    return 'ok';
  }
}
