import { type OpenApi3Dot1ResponsesObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1ReferenceObjectFixtures } from './OpenApi3Dot1ReferenceObjectFixtures.js';
import { OpenApi3Dot1ResponseObjectFixtures } from './OpenApi3Dot1ResponseObjectFixtures.js';

export class OpenApi3Dot1ResponsesObjectFixtures {
  public static get withResponse(): OpenApi3Dot1ResponsesObject {
    return {
      '200': OpenApi3Dot1ResponseObjectFixtures.withContentAndHeaders,
    };
  }

  public static get withReferenceResponse(): OpenApi3Dot1ResponsesObject {
    return {
      '200': OpenApi3Dot1ReferenceObjectFixtures.any,
    };
  }
}
