import { Controller, Get, Query } from '@inversifyjs/http-core';

export interface Content {
  content: string;
}

// Begin-example
@Controller('/content')
export class ContentController {
  @Get()
  public async getContent(
    @Query() queryParams: { content: string },
  ): Promise<Content> {
    return {
      content: queryParams.content,
    };
  }
}
