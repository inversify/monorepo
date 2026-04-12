import { type OpenApi3Dot2ResponseObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2HeaderObjectFixtures } from './OpenApi3Dot2HeaderObjectFixtures.js';
import { OpenApi3Dot2MediaTypeObjectFixtures } from './OpenApi3Dot2MediaTypeObjectFixtures.js';

export class OpenApi3Dot2ResponseObjectFixtures {
  public static get withContentAndHeaders(): OpenApi3Dot2ResponseObject {
    return {
      content: {
        'application/json': OpenApi3Dot2MediaTypeObjectFixtures.withSchema,
      },
      description: 'description',
      headers: {
        header: OpenApi3Dot2HeaderObjectFixtures.withSchemaOnly,
      },
    };
  }

  public static get withContentOnly(): OpenApi3Dot2ResponseObject {
    return {
      content: {
        'application/json': OpenApi3Dot2MediaTypeObjectFixtures.withSchema,
      },
      description: 'description',
    };
  }

  public static get withHeadersOnly(): OpenApi3Dot2ResponseObject {
    return {
      description: 'description',
      headers: {
        header: OpenApi3Dot2HeaderObjectFixtures.withSchemaOnly,
      },
    };
  }

  public static get withoutContentAndHeaders(): OpenApi3Dot2ResponseObject {
    return {
      description: 'description',
    };
  }
}
