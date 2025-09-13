import { Controller, Get } from '@inversifyjs/http-core';
import { OasExternalDocs } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class ExternalDocsController {
  @OasExternalDocs({
    description: 'Find more info here',
    url: 'https://example.com/docs',
  })
  @Get()
  public async getMessage(): Promise<MessageResult> {
    return {
      message: 'Hello, World!',
    };
  }
}
