import { type OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1ParameterObjectFixtures } from './OpenApi3Dot1ParameterObjectFixtures.js';
import { OpenApi3Dot1ReferenceObjectFixtures } from './OpenApi3Dot1ReferenceObjectFixtures.js';
import { OpenApi3Dot1RequestBodyObjectFixtures } from './OpenApi3Dot1RequestBodyObjectFixtures.js';
import { OpenApi3Dot1ResponsesObjectFixtures } from './OpenApi3Dot1ResponsesObjectFixtures.js';

export class OpenApi3Dot1OperationObjectFixtures {
  public static get withCallbacksOnly(): OpenApi3Dot1OperationObject {
    return {
      callbacks: {
        event: {
          '{$request.query.url}': {
            get: {
              responses: OpenApi3Dot1ResponsesObjectFixtures.withResponse,
            },
          },
        },
      },
    };
  }

  public static get withReferenceCallback(): OpenApi3Dot1OperationObject {
    return {
      callbacks: {
        event: OpenApi3Dot1ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withParametersOnly(): OpenApi3Dot1OperationObject {
    return {
      parameters: [OpenApi3Dot1ParameterObjectFixtures.withSchemaOnly],
    };
  }

  public static get withReferenceParameter(): OpenApi3Dot1OperationObject {
    return {
      parameters: [OpenApi3Dot1ReferenceObjectFixtures.any],
    };
  }

  public static get withRequestBodyOnly(): OpenApi3Dot1OperationObject {
    return {
      requestBody: OpenApi3Dot1RequestBodyObjectFixtures.any,
    };
  }

  public static get withReferenceRequestBody(): OpenApi3Dot1OperationObject {
    return {
      requestBody: OpenApi3Dot1ReferenceObjectFixtures.any,
    };
  }

  public static get withUndefinedRequestBody(): OpenApi3Dot1OperationObject {
    return {};
  }

  public static get withResponsesOnly(): OpenApi3Dot1OperationObject {
    return {
      responses: OpenApi3Dot1ResponsesObjectFixtures.withResponse,
    };
  }

  public static get empty(): OpenApi3Dot1OperationObject {
    return {};
  }
}
