import { type OpenApi3Dot1ReferenceObject } from '@inversifyjs/open-api-types/v3Dot1';

export class OpenApi3Dot1ReferenceObjectFixtures {
  public static get any(): OpenApi3Dot1ReferenceObject {
    return {
      $ref: '#/components/schemas/schema',
    };
  }
}
