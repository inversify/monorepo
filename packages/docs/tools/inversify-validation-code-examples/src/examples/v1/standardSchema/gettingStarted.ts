/* eslint-disable @typescript-eslint/no-magic-numbers */

// Begin-example
import { Body, Controller, Post } from '@inversifyjs/http-core';
import { ValidateStandardSchemaV1 } from '@inversifyjs/standard-schema-validation';
import zod from 'zod';

interface Message {
  content: string;
}

@Controller('/messages')
export class MessageController {
  @Post()
  public async createMessage(
    @Body()
    @ValidateStandardSchemaV1(
      zod.object({ content: zod.string().max(100) }).strict(),
    )
    message: Message,
  ): Promise<Message> {
    return message;
  }
}
