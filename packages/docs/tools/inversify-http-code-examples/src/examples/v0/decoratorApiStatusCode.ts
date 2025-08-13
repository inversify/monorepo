import {
  Body,
  Controller,
  HttpStatusCode,
  Post,
  StatusCode,
} from '@inversifyjs/http-core';

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
  @StatusCode(HttpStatusCode.CREATED)
  public async createMessage(@Body() body: BodyPayload): Promise<BodyResult> {
    return {
      message: body.message,
    };
  }
}
