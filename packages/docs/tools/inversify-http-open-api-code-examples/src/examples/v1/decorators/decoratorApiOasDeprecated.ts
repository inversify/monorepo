import { Controller, Get } from '@inversifyjs/http-core';
import { OasDeprecated } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class DeprecatedController {
  @OasDeprecated()
  @Get()
  public async getOldMessage(): Promise<MessageResult> {
    return {
      message: 'This endpoint is deprecated!',
    };
  }
}
