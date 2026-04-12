import { type OpenApi3Dot2MediaTypeObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2SchemaObjectFixtures } from './OpenApi3Dot2SchemaObjectFixtures.js';

export class OpenApi3Dot2MediaTypeObjectFixtures {
  public static get withItemSchema(): OpenApi3Dot2MediaTypeObject {
    return {
      itemSchema: OpenApi3Dot2SchemaObjectFixtures.any,
    };
  }

  public static get withItemSchemaAndSchema(): OpenApi3Dot2MediaTypeObject {
    return {
      itemSchema: OpenApi3Dot2SchemaObjectFixtures.any,
      schema: OpenApi3Dot2SchemaObjectFixtures.any,
    };
  }

  public static get withSchema(): OpenApi3Dot2MediaTypeObject {
    return {
      schema: OpenApi3Dot2SchemaObjectFixtures.any,
    };
  }

  public static get withoutSchema(): OpenApi3Dot2MediaTypeObject {
    return {};
  }
}
