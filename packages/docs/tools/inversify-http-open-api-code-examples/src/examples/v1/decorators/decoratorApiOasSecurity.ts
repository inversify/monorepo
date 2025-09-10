import { Controller, Get } from '@inversifyjs/http-core';
import { OasSecurity } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class SecurityController {
  @OasSecurity({
    bearerAuth: [],
  })
  @Get()
  public async getSecureMessage(): Promise<MessageResult> {
    return {
      message: 'This is a secure message!',
    };
  }
}
