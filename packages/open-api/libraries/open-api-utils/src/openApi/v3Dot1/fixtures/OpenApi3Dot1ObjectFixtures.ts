import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1ComponentsObjectFixtures } from './OpenApi3Dot1ComponentsObjectFixtures.js';
import { OpenApi3Dot1PathItemObjectFixtures } from './OpenApi3Dot1PathItemObjectFixtures.js';
import { OpenApi3Dot1PathsObjectFixtures } from './OpenApi3Dot1PathsObjectFixtures.js';

export class OpenApi3Dot1ObjectFixtures {
  public static get withComponents(): OpenApi3Dot1Object {
    return {
      components: OpenApi3Dot1ComponentsObjectFixtures.withSchemas,
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
    };
  }

  public static get withPaths(): OpenApi3Dot1Object {
    return {
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
      paths: OpenApi3Dot1PathsObjectFixtures.withOnePath,
    };
  }

  public static get withWebhooks(): OpenApi3Dot1Object {
    return {
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
      webhooks: {
        event: OpenApi3Dot1PathItemObjectFixtures.withGetOnly,
      },
    };
  }

  public static get empty(): OpenApi3Dot1Object {
    return {
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
    };
  }
}
