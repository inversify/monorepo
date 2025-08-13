import { All, Controller } from '@inversifyjs/http-core';

export interface Content {
  content: string;
}

// Begin-example
@Controller('/content')
export class ContentController {
  @All()
  public async allContent(): Promise<void> {}
}
