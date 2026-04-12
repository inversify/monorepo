import { type OpenApi3Dot1HeaderObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1MediaTypeObjectFixtures } from './OpenApi3Dot1MediaTypeObjectFixtures.js';
import { OpenApi3Dot1SchemaObjectFixtures } from './OpenApi3Dot1SchemaObjectFixtures.js';

export class OpenApi3Dot1HeaderObjectFixtures {
  public static get withContentAndSchema(): OpenApi3Dot1HeaderObject {
    return {
      content: {
        'application/json': OpenApi3Dot1MediaTypeObjectFixtures.withSchema,
      },
      schema: OpenApi3Dot1SchemaObjectFixtures.any,
    };
  }

  public static get withContentOnly(): OpenApi3Dot1HeaderObject {
    return {
      content: {
        'application/json': OpenApi3Dot1MediaTypeObjectFixtures.withSchema,
      },
    };
  }

  public static get withSchemaOnly(): OpenApi3Dot1HeaderObject {
    return {
      schema: OpenApi3Dot1SchemaObjectFixtures.any,
    };
  }

  public static get withoutContentAndSchema(): OpenApi3Dot1HeaderObject {
    return {};
  }
}
