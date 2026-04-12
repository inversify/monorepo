import { type OpenApi3Dot1PathsObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1PathItemObjectFixtures } from './OpenApi3Dot1PathItemObjectFixtures.js';

export class OpenApi3Dot1PathsObjectFixtures {
  public static get withOnePath(): OpenApi3Dot1PathsObject {
    return {
      '/path': OpenApi3Dot1PathItemObjectFixtures.withGetOnly,
    };
  }
}
