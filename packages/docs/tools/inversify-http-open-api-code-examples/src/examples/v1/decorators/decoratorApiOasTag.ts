import { Controller, Get } from '@inversifyjs/http-core';
import { OasTag } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class TagController {
  @OasTag('messages')
  @OasTag('greetings')
  @Get()
  public async getMessage(): Promise<MessageResult> {
    return {
      message: 'Hello, World!',
    };
  }
}
