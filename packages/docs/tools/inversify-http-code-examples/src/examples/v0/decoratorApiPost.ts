import { Body, Controller, Post } from '@inversifyjs/http-core';

export interface Content {
  content: string;
}

// Begin-example
@Controller('/content')
export class ContentController {
  @Post()
  public async createContent(
    @Body() body: { content: string },
  ): Promise<Content> {
    return {
      content: body.content,
    };
  }
}
