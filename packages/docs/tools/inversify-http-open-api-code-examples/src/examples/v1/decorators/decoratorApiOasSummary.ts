import { Controller, Get } from '@inversifyjs/http-core';
import { OasSummary } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class SummaryController {
  @OasSummary('Get welcome message')
  @Get()
  public async getMessage(): Promise<MessageResult> {
    return {
      message: 'Hello, World!',
    };
  }
}
