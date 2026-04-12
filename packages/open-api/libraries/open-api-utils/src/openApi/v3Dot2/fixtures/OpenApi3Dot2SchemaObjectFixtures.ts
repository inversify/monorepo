import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

export class OpenApi3Dot2SchemaObjectFixtures {
  public static get any(): OpenApi3Dot2SchemaObject {
    return { type: 'object' };
  }
}
