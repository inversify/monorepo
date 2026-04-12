import { type OpenApi3Dot2ParameterObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2MediaTypeObjectFixtures } from './OpenApi3Dot2MediaTypeObjectFixtures.js';
import { OpenApi3Dot2SchemaObjectFixtures } from './OpenApi3Dot2SchemaObjectFixtures.js';

export class OpenApi3Dot2ParameterObjectFixtures {
  public static get withContentAndSchema(): OpenApi3Dot2ParameterObject {
    return {
      content: {
        'application/json': OpenApi3Dot2MediaTypeObjectFixtures.withSchema,
      },
      in: 'query',
      name: 'param',
      schema: OpenApi3Dot2SchemaObjectFixtures.any,
    };
  }

  public static get withContentOnly(): OpenApi3Dot2ParameterObject {
    return {
      content: {
        'application/json': OpenApi3Dot2MediaTypeObjectFixtures.withSchema,
      },
      in: 'query',
      name: 'param',
    };
  }

  public static get withSchemaOnly(): OpenApi3Dot2ParameterObject {
    return {
      in: 'query',
      name: 'param',
      schema: OpenApi3Dot2SchemaObjectFixtures.any,
    };
  }

  public static get withoutContentAndSchema(): OpenApi3Dot2ParameterObject {
    return {
      in: 'query',
      name: 'param',
    };
  }
}
