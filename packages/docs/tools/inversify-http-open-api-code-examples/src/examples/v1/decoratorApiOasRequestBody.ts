import { Body, Controller, Post } from '@inversifyjs/http-core';
import { OasRequestBody } from '@inversifyjs/http-open-api';

export interface BodyPayload {
  message: string;
}

export interface BodyResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class BodyController {
  @OasRequestBody({
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
  })
  @Post()
  public async createMessage(@Body() body: BodyPayload): Promise<BodyResult> {
    return {
      message: body.message,
    };
  }
}
