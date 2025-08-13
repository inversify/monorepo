import { Body, Controller, Post, SetHeader } from '@inversifyjs/http-core';

export interface BodyPayload {
  message: string;
}

export interface BodyResult {
  message: string;
}

// Begin-example
@Controller('/messages')
export class ContentController {
  @Post()
  @SetHeader('custom-content-header', 'sample')
  public async createMessage(@Body() body: BodyPayload): Promise<BodyResult> {
    return {
      message: body.message,
    };
  }
}
