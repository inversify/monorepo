import { Body, Controller, Post } from '@inversifyjs/http-core';

export interface BodyPayload {
  message: string;
}

export interface BodyResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class BodyController {
  @Post()
  public async createMessage(@Body() body: BodyPayload): Promise<BodyResult> {
    return {
      message: body.message,
    };
  }
}
