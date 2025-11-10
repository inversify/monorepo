import { Body, Controller, Post } from '@inversifyjs/http-core';

export interface TextResult {
  content: string;
  length: number;
}

// Begin-example
@Controller('/documents')
export class BodyTextController {
  @Post()
  public async createDocument(@Body() body: string): Promise<TextResult> {
    // Body is received as a string when Content-Type is text/plain or text/*
    return {
      content: body,
      length: body.length,
    };
  }
}
