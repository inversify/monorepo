import { Controller, Cookies, Get } from '@inversifyjs/http-core';

export interface CookiesResult {
  sessionId: string | undefined;
}

// Begin-example
@Controller('/cookies')
export class CookiesController {
  @Get()
  public async getCookie(
    @Cookies({
      name: 'sessionId',
    })
    sessionId: string | undefined,
  ): Promise<CookiesResult> {
    return {
      sessionId,
    };
  }
}
