import { type OpenApi3Dot2PathsObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2PathItemObjectFixtures } from './OpenApi3Dot2PathItemObjectFixtures.js';

export class OpenApi3Dot2PathsObjectFixtures {
  public static get withOnePath(): OpenApi3Dot2PathsObject {
    return {
      '/path': OpenApi3Dot2PathItemObjectFixtures.withGetOnly,
    };
  }
}
