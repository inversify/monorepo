import { Controller, Get } from '@inversifyjs/http-core';
import { OasOperationId } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class OperationIdController {
  @OasOperationId('getWelcomeMessage')
  @Get()
  public async getMessage(): Promise<MessageResult> {
    return {
      message: 'Hello, World!',
    };
  }
}
