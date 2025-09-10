import { Controller, Get } from '@inversifyjs/http-core';
import { OasServer } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

// Begin-example
@OasServer({
  description: 'Development server',
  url: 'http://localhost:3000',
})
@Controller('/messages')
export class ServerController {
  @OasServer({
    description: 'Production server for this endpoint',
    url: 'https://api.example.com',
  })
  @Get()
  public async getMessage(): Promise<MessageResult> {
    return {
      message: 'Hello, World!',
    };
  }
}
