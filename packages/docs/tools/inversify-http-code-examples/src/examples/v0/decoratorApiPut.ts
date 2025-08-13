import { Body, Controller, Put } from '@inversifyjs/http-core';

export interface Content {
  content: string;
}

// Begin-example
@Controller('/content')
export class ContentController {
  @Put()
  public async updateContent(
    @Body() body: { content: string },
  ): Promise<Content> {
    return {
      content: body.content,
    };
  }
}
