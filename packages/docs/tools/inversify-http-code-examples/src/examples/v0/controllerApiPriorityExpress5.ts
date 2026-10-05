import {
  Body,
  Controller,
  Get,
  HttpStatusCode,
  Post,
  StatusCode,
} from '@inversifyjs/http-core';

export interface Message {
  content: string;
}

export interface CreateMessageRequest {
  content: string;
}

// Begin-example
// Priority constants to make intent clear
const PRIORITY_HIGHEST: number = 1000;
const PRIORITY_DEFAULT: number = 0;
const PRIORITY_LOWEST: number = -1000;

// High priority controller - registered first
@Controller({
  path: '/api/messages',
  priority: PRIORITY_HIGHEST,
})
export class MessagesController {
  @Get()
  public async getMessages(): Promise<Message[]> {
    return [{ content: 'Hello, World!' }];
  }

  @Post()
  @StatusCode(HttpStatusCode.CREATED)
  public async createMessage(
    @Body() body: CreateMessageRequest,
  ): Promise<Message> {
    return { content: body.content };
  }
}

// Default priority controller
@Controller({
  path: '/api/health',
  priority: PRIORITY_DEFAULT,
})
export class HealthController {
  @Get()
  public async healthCheck(): Promise<{ status: string }> {
    return { status: 'ok' };
  }
}

// Low priority fallback controller - registered last to catch unmatched routes
@Controller({
  priority: PRIORITY_LOWEST,
})
export class FallbackController {
  @Get('/{*any}')
  @StatusCode(HttpStatusCode.NOT_FOUND)
  public async notFound(): Promise<{ error: string; message: string }> {
    return {
      error: 'Not Found',
      message: 'The requested resource was not found',
    };
  }
}
// End-example
