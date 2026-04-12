import { type OpenApi3Dot1CallbackObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1SchemaObjectFixtures } from './OpenApi3Dot1SchemaObjectFixtures.js';

export class OpenApi3Dot1CallbackObjectFixtures {
  public static get any(): OpenApi3Dot1CallbackObject {
    return {
      '{$request.query.url}': {
        get: {
          parameters: [
            {
              in: 'query',
              name: 'param',
              schema: OpenApi3Dot1SchemaObjectFixtures.any,
            },
          ],
        },
      },
    };
  }
}
