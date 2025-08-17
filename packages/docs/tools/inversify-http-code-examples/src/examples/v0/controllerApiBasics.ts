import { Controller, Get } from '@inversifyjs/http-core';

export interface Message {
  content: string;
}

// Begin-example
@Controller('/messages')
export class MessagesController {
  @Get('/hello')
  public async sayHello(): Promise<Message> {
    return { content: 'world' };
  }
}
// End-example
