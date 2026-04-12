import { type OpenApi3Dot1MediaTypeObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1SchemaObjectFixtures } from './OpenApi3Dot1SchemaObjectFixtures.js';

export class OpenApi3Dot1MediaTypeObjectFixtures {
  public static get withSchema(): OpenApi3Dot1MediaTypeObject {
    return {
      schema: OpenApi3Dot1SchemaObjectFixtures.any,
    };
  }

  public static get withoutSchema(): OpenApi3Dot1MediaTypeObject {
    return {};
  }
}
