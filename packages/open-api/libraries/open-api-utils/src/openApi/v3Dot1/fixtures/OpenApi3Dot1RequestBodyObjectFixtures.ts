import { type OpenApi3Dot1RequestBodyObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1MediaTypeObjectFixtures } from './OpenApi3Dot1MediaTypeObjectFixtures.js';

export class OpenApi3Dot1RequestBodyObjectFixtures {
  public static get any(): OpenApi3Dot1RequestBodyObject {
    return {
      content: {
        'application/json': OpenApi3Dot1MediaTypeObjectFixtures.withSchema,
      },
    };
  }
}
