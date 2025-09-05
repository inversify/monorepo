import { Controller, Get } from '@inversifyjs/http-core';

@Controller()
export class AppController {
  @Get()
  public ok(): string {
    return 'ok';
  }
}
