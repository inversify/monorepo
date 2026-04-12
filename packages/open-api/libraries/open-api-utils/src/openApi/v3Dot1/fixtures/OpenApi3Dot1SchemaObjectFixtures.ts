import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

export class OpenApi3Dot1SchemaObjectFixtures {
  public static get any(): OpenApi3Dot1SchemaObject {
    return { type: 'object' };
  }
}
