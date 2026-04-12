import { type OpenApi3Dot1ComponentsObject } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1CallbackObjectFixtures } from './OpenApi3Dot1CallbackObjectFixtures.js';
import { OpenApi3Dot1HeaderObjectFixtures } from './OpenApi3Dot1HeaderObjectFixtures.js';
import { OpenApi3Dot1ParameterObjectFixtures } from './OpenApi3Dot1ParameterObjectFixtures.js';
import { OpenApi3Dot1PathItemObjectFixtures } from './OpenApi3Dot1PathItemObjectFixtures.js';
import { OpenApi3Dot1ReferenceObjectFixtures } from './OpenApi3Dot1ReferenceObjectFixtures.js';
import { OpenApi3Dot1RequestBodyObjectFixtures } from './OpenApi3Dot1RequestBodyObjectFixtures.js';
import { OpenApi3Dot1ResponseObjectFixtures } from './OpenApi3Dot1ResponseObjectFixtures.js';
import { OpenApi3Dot1SchemaObjectFixtures } from './OpenApi3Dot1SchemaObjectFixtures.js';

export class OpenApi3Dot1ComponentsObjectFixtures {
  public static get withCallbacks(): OpenApi3Dot1ComponentsObject {
    return {
      callbacks: {
        event: OpenApi3Dot1CallbackObjectFixtures.any,
      },
    };
  }

  public static get withReferenceCallbacks(): OpenApi3Dot1ComponentsObject {
    return {
      callbacks: {
        event: OpenApi3Dot1ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withHeaders(): OpenApi3Dot1ComponentsObject {
    return {
      headers: {
        header: OpenApi3Dot1HeaderObjectFixtures.withSchemaOnly,
      },
    };
  }

  public static get withParameters(): OpenApi3Dot1ComponentsObject {
    return {
      parameters: {
        param: OpenApi3Dot1ParameterObjectFixtures.withSchemaOnly,
      },
    };
  }

  public static get withReferenceParameters(): OpenApi3Dot1ComponentsObject {
    return {
      parameters: {
        param: OpenApi3Dot1ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withPathItems(): OpenApi3Dot1ComponentsObject {
    return {
      pathItems: {
        path: OpenApi3Dot1PathItemObjectFixtures.withGetOnly,
      },
    };
  }

  public static get withRequestBodies(): OpenApi3Dot1ComponentsObject {
    return {
      requestBodies: {
        body: OpenApi3Dot1RequestBodyObjectFixtures.any,
      },
    };
  }

  public static get withReferenceRequestBodies(): OpenApi3Dot1ComponentsObject {
    return {
      requestBodies: {
        body: OpenApi3Dot1ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withResponses(): OpenApi3Dot1ComponentsObject {
    return {
      responses: {
        response: OpenApi3Dot1ResponseObjectFixtures.withContentOnly,
      },
    };
  }

  public static get withReferenceResponses(): OpenApi3Dot1ComponentsObject {
    return {
      responses: {
        response: OpenApi3Dot1ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withSchemas(): OpenApi3Dot1ComponentsObject {
    return {
      schemas: {
        schema: OpenApi3Dot1SchemaObjectFixtures.any,
      },
    };
  }
}
