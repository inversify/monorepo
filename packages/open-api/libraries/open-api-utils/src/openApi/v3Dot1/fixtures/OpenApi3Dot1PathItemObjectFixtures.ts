import { type OpenApi3Dot1PathItemObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1OperationObjectFixtures } from './OpenApi3Dot1OperationObjectFixtures.js';
import { OpenApi3Dot1ParameterObjectFixtures } from './OpenApi3Dot1ParameterObjectFixtures.js';
import { OpenApi3Dot1ReferenceObjectFixtures } from './OpenApi3Dot1ReferenceObjectFixtures.js';

export class OpenApi3Dot1PathItemObjectFixtures {
  public static get withGetOnly(): OpenApi3Dot1PathItemObject {
    return {
      get: OpenApi3Dot1OperationObjectFixtures.empty,
    };
  }

  public static get withParameters(): OpenApi3Dot1PathItemObject {
    return {
      parameters: [OpenApi3Dot1ParameterObjectFixtures.withSchemaOnly],
    };
  }

  public static get withReferenceParameter(): OpenApi3Dot1PathItemObject {
    return {
      parameters: [OpenApi3Dot1ReferenceObjectFixtures.any],
    };
  }

  public static get withAllMethods(): OpenApi3Dot1PathItemObject {
    return {
      delete: OpenApi3Dot1OperationObjectFixtures.empty,
      get: OpenApi3Dot1OperationObjectFixtures.empty,
      head: OpenApi3Dot1OperationObjectFixtures.empty,
      options: OpenApi3Dot1OperationObjectFixtures.empty,
      patch: OpenApi3Dot1OperationObjectFixtures.empty,
      post: OpenApi3Dot1OperationObjectFixtures.empty,
      put: OpenApi3Dot1OperationObjectFixtures.empty,
      trace: OpenApi3Dot1OperationObjectFixtures.empty,
    };
  }

  public static get empty(): OpenApi3Dot1PathItemObject {
    return {};
  }
}
