import { type OpenApi3Dot2OperationObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2ParameterObjectFixtures } from './OpenApi3Dot2ParameterObjectFixtures.js';
import { OpenApi3Dot2ReferenceObjectFixtures } from './OpenApi3Dot2ReferenceObjectFixtures.js';
import { OpenApi3Dot2RequestBodyObjectFixtures } from './OpenApi3Dot2RequestBodyObjectFixtures.js';
import { OpenApi3Dot2ResponsesObjectFixtures } from './OpenApi3Dot2ResponsesObjectFixtures.js';

export class OpenApi3Dot2OperationObjectFixtures {
  public static get withCallbacksOnly(): OpenApi3Dot2OperationObject {
    return {
      callbacks: {
        event: {
          '{$request.query.url}': {
            get: {
              responses: OpenApi3Dot2ResponsesObjectFixtures.withResponse,
            },
          },
        },
      },
    };
  }

  public static get withReferenceCallback(): OpenApi3Dot2OperationObject {
    return {
      callbacks: {
        event: OpenApi3Dot2ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withParametersOnly(): OpenApi3Dot2OperationObject {
    return {
      parameters: [OpenApi3Dot2ParameterObjectFixtures.withSchemaOnly],
    };
  }

  public static get withReferenceParameter(): OpenApi3Dot2OperationObject {
    return {
      parameters: [OpenApi3Dot2ReferenceObjectFixtures.any],
    };
  }

  public static get withRequestBodyOnly(): OpenApi3Dot2OperationObject {
    return {
      requestBody: OpenApi3Dot2RequestBodyObjectFixtures.any,
    };
  }

  public static get withReferenceRequestBody(): OpenApi3Dot2OperationObject {
    return {
      requestBody: OpenApi3Dot2ReferenceObjectFixtures.any,
    };
  }

  public static get withUndefinedRequestBody(): OpenApi3Dot2OperationObject {
    return {};
  }

  public static get withResponsesOnly(): OpenApi3Dot2OperationObject {
    return {
      responses: OpenApi3Dot2ResponsesObjectFixtures.withResponse,
    };
  }

  public static get empty(): OpenApi3Dot2OperationObject {
    return {};
  }
}
