import { type OpenApi3Dot2RequestBodyObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2MediaTypeObjectFixtures } from './OpenApi3Dot2MediaTypeObjectFixtures.js';
import { OpenApi3Dot2ReferenceObjectFixtures } from './OpenApi3Dot2ReferenceObjectFixtures.js';

export class OpenApi3Dot2RequestBodyObjectFixtures {
  public static get any(): OpenApi3Dot2RequestBodyObject {
    return {
      content: {
        'application/json': OpenApi3Dot2MediaTypeObjectFixtures.withSchema,
      },
    };
  }

  public static get withReferenceContent(): OpenApi3Dot2RequestBodyObject {
    return {
      content: {
        'application/json': OpenApi3Dot2ReferenceObjectFixtures.any,
      },
    };
  }
}
