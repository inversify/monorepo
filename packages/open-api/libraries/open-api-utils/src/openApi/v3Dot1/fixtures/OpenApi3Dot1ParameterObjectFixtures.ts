import { type OpenApi3Dot1ParameterObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1MediaTypeObjectFixtures } from './OpenApi3Dot1MediaTypeObjectFixtures.js';
import { OpenApi3Dot1SchemaObjectFixtures } from './OpenApi3Dot1SchemaObjectFixtures.js';

export class OpenApi3Dot1ParameterObjectFixtures {
  public static get withContentAndSchema(): OpenApi3Dot1ParameterObject {
    return {
      content: {
        'application/json': OpenApi3Dot1MediaTypeObjectFixtures.withSchema,
      },
      in: 'query',
      name: 'param',
      schema: OpenApi3Dot1SchemaObjectFixtures.any,
    };
  }

  public static get withContentOnly(): OpenApi3Dot1ParameterObject {
    return {
      content: {
        'application/json': OpenApi3Dot1MediaTypeObjectFixtures.withSchema,
      },
      in: 'query',
      name: 'param',
    };
  }

  public static get withSchemaOnly(): OpenApi3Dot1ParameterObject {
    return {
      in: 'query',
      name: 'param',
      schema: OpenApi3Dot1SchemaObjectFixtures.any,
    };
  }

  public static get withoutContentAndSchema(): OpenApi3Dot1ParameterObject {
    return {
      in: 'query',
      name: 'param',
    };
  }
}
