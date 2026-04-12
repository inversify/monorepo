import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2ComponentsObjectFixtures } from './OpenApi3Dot2ComponentsObjectFixtures.js';
import { OpenApi3Dot2PathItemObjectFixtures } from './OpenApi3Dot2PathItemObjectFixtures.js';
import { OpenApi3Dot2PathsObjectFixtures } from './OpenApi3Dot2PathsObjectFixtures.js';

export class OpenApi3Dot2ObjectFixtures {
  public static get withComponents(): OpenApi3Dot2Object {
    return {
      components: OpenApi3Dot2ComponentsObjectFixtures.withSchemas,
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
    };
  }

  public static get withPaths(): OpenApi3Dot2Object {
    return {
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
      paths: OpenApi3Dot2PathsObjectFixtures.withOnePath,
    };
  }

  public static get withWebhooks(): OpenApi3Dot2Object {
    return {
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
      webhooks: {
        event: OpenApi3Dot2PathItemObjectFixtures.withGetOnly,
      },
    };
  }

  public static get empty(): OpenApi3Dot2Object {
    return {
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
    };
  }
}
