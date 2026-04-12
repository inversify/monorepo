import { type OpenApi3Dot2PathItemObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2OperationObjectFixtures } from './OpenApi3Dot2OperationObjectFixtures.js';
import { OpenApi3Dot2ParameterObjectFixtures } from './OpenApi3Dot2ParameterObjectFixtures.js';
import { OpenApi3Dot2ReferenceObjectFixtures } from './OpenApi3Dot2ReferenceObjectFixtures.js';

export class OpenApi3Dot2PathItemObjectFixtures {
  public static get withGetOnly(): OpenApi3Dot2PathItemObject {
    return {
      get: OpenApi3Dot2OperationObjectFixtures.empty,
    };
  }

  public static get withParameters(): OpenApi3Dot2PathItemObject {
    return {
      parameters: [OpenApi3Dot2ParameterObjectFixtures.withSchemaOnly],
    };
  }

  public static get withReferenceParameter(): OpenApi3Dot2PathItemObject {
    return {
      parameters: [OpenApi3Dot2ReferenceObjectFixtures.any],
    };
  }

  public static get withAllMethods(): OpenApi3Dot2PathItemObject {
    return {
      delete: OpenApi3Dot2OperationObjectFixtures.empty,
      get: OpenApi3Dot2OperationObjectFixtures.empty,
      head: OpenApi3Dot2OperationObjectFixtures.empty,
      options: OpenApi3Dot2OperationObjectFixtures.empty,
      patch: OpenApi3Dot2OperationObjectFixtures.empty,
      post: OpenApi3Dot2OperationObjectFixtures.empty,
      put: OpenApi3Dot2OperationObjectFixtures.empty,
      query: OpenApi3Dot2OperationObjectFixtures.empty,
      trace: OpenApi3Dot2OperationObjectFixtures.empty,
    };
  }

  public static get withAdditionalOperations(): OpenApi3Dot2PathItemObject {
    return {
      additionalOperations: {
        customOp: OpenApi3Dot2OperationObjectFixtures.withParametersOnly,
      },
    };
  }

  public static get empty(): OpenApi3Dot2PathItemObject {
    return {};
  }
}
