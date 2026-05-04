import { Controller, Get } from '@inversifyjs/http-core';

@Controller('/test-cors')
export class WarriorsGetTestCorsController {
  @Get()
  public async get(): Promise<void> {}
}
