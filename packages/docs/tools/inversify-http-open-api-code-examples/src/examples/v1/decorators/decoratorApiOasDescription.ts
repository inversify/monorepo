import { Controller, Get } from '@inversifyjs/http-core';
import { OasDescription } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class DescriptionController {
  @OasDescription('Retrieves a welcome message')
  @Get()
  public async getMessage(): Promise<MessageResult> {
    return {
      message: 'Hello, World!',
    };
  }
}
