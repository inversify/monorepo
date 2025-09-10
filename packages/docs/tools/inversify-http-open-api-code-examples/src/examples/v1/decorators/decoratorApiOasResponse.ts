import { Controller, Get, HttpStatusCode } from '@inversifyjs/http-core';
import { OasResponse } from '@inversifyjs/http-open-api';

export interface MessageResult {
  message: string;
}

export interface ErrorResult {
  error: string;
}

// Begin-example
@Controller('/messages')
export class ResponseController {
  @OasResponse(HttpStatusCode.OK, {
    content: {
      'application/json': {
        schema: {
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
          type: 'object',
        },
      },
    },
    description: 'Successful response',
  })
  @OasResponse(HttpStatusCode.NOT_FOUND, {
    content: {
      'application/json': {
        schema: {
          properties: {
            error: { type: 'string' },
          },
          required: ['error'],
          type: 'object',
        },
      },
    },
    description: 'Message not found',
  })
  @Get()
  public async getMessage(): Promise<MessageResult> {
    return {
      message: 'Hello, World!',
    };
  }
}
