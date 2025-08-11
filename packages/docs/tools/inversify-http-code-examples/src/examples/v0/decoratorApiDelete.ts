import { Controller, Delete, Query } from '@inversifyjs/http-core';

export interface Content {
  content: string;
}

@Controller('/content')
export class ContentController {
  @Delete()
  public async deleteContent(
    @Query() queryParams: { content: string },
  ): Promise<Content> {
    return {
      content: queryParams.content,
    };
  }
}
