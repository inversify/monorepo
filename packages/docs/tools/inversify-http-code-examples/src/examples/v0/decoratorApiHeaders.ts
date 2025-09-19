import { Controller, Get, Headers } from '@inversifyjs/http-core';

export interface HeadersResult {
  agent: string | undefined;
}

// Begin-example
@Controller('/headers')
export class HeadersController {
  @Get()
  public async getUserAgent(
    @Headers({
      name: 'x-client',
    })
    userAgent: string | undefined,
  ): Promise<HeadersResult> {
    return {
      agent: userAgent,
    };
  }
}
