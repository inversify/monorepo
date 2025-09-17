// Begin-example
import { Body, Controller, Post } from '@inversifyjs/http-core';
import { IsString } from 'class-validator';

class Message {
  @IsString()
  public readonly content!: string;
}

@Controller('/messages')
export class MessageController {
  @Post()
  public async createMessage(
    @Body()
    message: Message,
  ): Promise<Message> {
    return message;
  }
}
// End-example
