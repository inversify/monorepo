import { Controller, Cookies, Get } from '@inversifyjs/http-core';

export interface CookiesResult {
  sessionId: string | undefined;
}

@Controller('/cookies')
export class CookiesController {
  @Get()
  public async getCookie(
    @Cookies('sessionId') sessionId: string | undefined,
  ): Promise<CookiesResult> {
    return {
      sessionId,
    };
  }
}
