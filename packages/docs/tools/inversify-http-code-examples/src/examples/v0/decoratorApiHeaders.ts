import { Controller, Get, Headers } from '@inversifyjs/http-core';

export interface HeadersResult {
  agent: string | undefined;
}

@Controller('/headers')
export class HeadersController {
  @Get()
  public async getUserAgent(
    @Headers('x-client') userAgent: string | undefined,
  ): Promise<HeadersResult> {
    return {
      agent: userAgent,
    };
  }
}
