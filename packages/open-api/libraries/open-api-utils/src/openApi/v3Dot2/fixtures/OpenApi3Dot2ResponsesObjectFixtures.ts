import { type OpenApi3Dot2ResponsesObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2ReferenceObjectFixtures } from './OpenApi3Dot2ReferenceObjectFixtures.js';
import { OpenApi3Dot2ResponseObjectFixtures } from './OpenApi3Dot2ResponseObjectFixtures.js';

export class OpenApi3Dot2ResponsesObjectFixtures {
  public static get withResponse(): OpenApi3Dot2ResponsesObject {
    return {
      '200': OpenApi3Dot2ResponseObjectFixtures.withContentAndHeaders,
    };
  }

  public static get withReferenceResponse(): OpenApi3Dot2ResponsesObject {
    return {
      '200': OpenApi3Dot2ReferenceObjectFixtures.any,
    };
  }
}
