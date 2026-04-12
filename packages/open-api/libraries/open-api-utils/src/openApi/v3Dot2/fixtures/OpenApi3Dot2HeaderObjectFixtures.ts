import { type OpenApi3Dot2HeaderObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2MediaTypeObjectFixtures } from './OpenApi3Dot2MediaTypeObjectFixtures.js';
import { OpenApi3Dot2ReferenceObjectFixtures } from './OpenApi3Dot2ReferenceObjectFixtures.js';
import { OpenApi3Dot2SchemaObjectFixtures } from './OpenApi3Dot2SchemaObjectFixtures.js';

export class OpenApi3Dot2HeaderObjectFixtures {
  public static get withContentAndSchema(): OpenApi3Dot2HeaderObject {
    return {
      content: {
        'application/json': OpenApi3Dot2MediaTypeObjectFixtures.withSchema,
      },
      schema: OpenApi3Dot2SchemaObjectFixtures.any,
    };
  }

  public static get withContentOnly(): OpenApi3Dot2HeaderObject {
    return {
      content: {
        'application/json': OpenApi3Dot2MediaTypeObjectFixtures.withSchema,
      },
    };
  }

  public static get withSchemaOnly(): OpenApi3Dot2HeaderObject {
    return {
      schema: OpenApi3Dot2SchemaObjectFixtures.any,
    };
  }

  public static get withReferenceContentAndSchema(): OpenApi3Dot2HeaderObject {
    return {
      content: {
        'application/json': OpenApi3Dot2ReferenceObjectFixtures.any,
      },
      schema: OpenApi3Dot2SchemaObjectFixtures.any,
    };
  }

  public static get withoutContentAndSchema(): OpenApi3Dot2HeaderObject {
    return {};
  }
}
