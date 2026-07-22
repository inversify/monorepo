import { Controller, Get } from '@inversifyjs/http-core';

@Controller()
export class AppController {
  @Get()
  public async ok(): Promise<string> {
    return 'ok';
  }
}
