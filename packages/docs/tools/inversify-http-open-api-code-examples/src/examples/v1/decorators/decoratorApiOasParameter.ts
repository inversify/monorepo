import { Controller, Get } from '@inversifyjs/http-core';
import { OasParameter } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
  userId: string;
}

// Begin-example
@Controller('/messages')
export class ParameterController {
  @OasParameter({
    description: 'The ID of the user',
    in: 'query',
    name: 'userId',
    required: true,
    schema: {
      type: 'string',
    },
  })
  @Get()
  public async getMessage(): Promise<MessageResult> {
    return {
      message: 'Hello, World!',
      userId: '123',
    };
  }
}
