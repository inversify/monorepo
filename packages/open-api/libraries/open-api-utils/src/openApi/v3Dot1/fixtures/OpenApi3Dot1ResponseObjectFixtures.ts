import { type OpenApi3Dot1ResponseObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1HeaderObjectFixtures } from './OpenApi3Dot1HeaderObjectFixtures.js';
import { OpenApi3Dot1MediaTypeObjectFixtures } from './OpenApi3Dot1MediaTypeObjectFixtures.js';

export class OpenApi3Dot1ResponseObjectFixtures {
  public static get withContentAndHeaders(): OpenApi3Dot1ResponseObject {
    return {
      content: {
        'application/json': OpenApi3Dot1MediaTypeObjectFixtures.withSchema,
      },
      description: 'description',
      headers: {
        header: OpenApi3Dot1HeaderObjectFixtures.withSchemaOnly,
      },
    };
  }

  public static get withContentOnly(): OpenApi3Dot1ResponseObject {
    return {
      content: {
        'application/json': OpenApi3Dot1MediaTypeObjectFixtures.withSchema,
      },
      description: 'description',
    };
  }

  public static get withHeadersOnly(): OpenApi3Dot1ResponseObject {
    return {
      description: 'description',
      headers: {
        header: OpenApi3Dot1HeaderObjectFixtures.withSchemaOnly,
      },
    };
  }

  public static get withoutContentAndHeaders(): OpenApi3Dot1ResponseObject {
    return {
      description: 'description',
    };
  }
}
