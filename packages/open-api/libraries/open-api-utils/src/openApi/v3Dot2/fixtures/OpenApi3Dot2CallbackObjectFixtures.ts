import { type OpenApi3Dot2CallbackObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2SchemaObjectFixtures } from './OpenApi3Dot2SchemaObjectFixtures.js';

export class OpenApi3Dot2CallbackObjectFixtures {
  public static get any(): OpenApi3Dot2CallbackObject {
    return {
      '{$request.query.url}': {
        get: {
          parameters: [
            {
              in: 'query',
              name: 'param',
              schema: OpenApi3Dot2SchemaObjectFixtures.any,
            },
          ],
        },
      },
    };
  }
}
