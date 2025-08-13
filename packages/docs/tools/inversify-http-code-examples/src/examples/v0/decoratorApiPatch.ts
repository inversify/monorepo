import { Body, Controller, Patch } from '@inversifyjs/http-core';

export interface Content {
  content: string;
}

// Begin-example
@Controller('/content')
export class ContentController {
  @Patch()
  public async patchContent(
    @Body() body: { content: string },
  ): Promise<Content> {
    return {
      content: body.content,
    };
  }
}
