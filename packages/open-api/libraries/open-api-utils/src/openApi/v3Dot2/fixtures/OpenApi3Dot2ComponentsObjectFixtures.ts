import { type OpenApi3Dot2ComponentsObject } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2CallbackObjectFixtures } from './OpenApi3Dot2CallbackObjectFixtures.js';
import { OpenApi3Dot2HeaderObjectFixtures } from './OpenApi3Dot2HeaderObjectFixtures.js';
import { OpenApi3Dot2MediaTypeObjectFixtures } from './OpenApi3Dot2MediaTypeObjectFixtures.js';
import { OpenApi3Dot2ParameterObjectFixtures } from './OpenApi3Dot2ParameterObjectFixtures.js';
import { OpenApi3Dot2PathItemObjectFixtures } from './OpenApi3Dot2PathItemObjectFixtures.js';
import { OpenApi3Dot2ReferenceObjectFixtures } from './OpenApi3Dot2ReferenceObjectFixtures.js';
import { OpenApi3Dot2RequestBodyObjectFixtures } from './OpenApi3Dot2RequestBodyObjectFixtures.js';
import { OpenApi3Dot2ResponseObjectFixtures } from './OpenApi3Dot2ResponseObjectFixtures.js';
import { OpenApi3Dot2SchemaObjectFixtures } from './OpenApi3Dot2SchemaObjectFixtures.js';

export class OpenApi3Dot2ComponentsObjectFixtures {
  public static get withCallbacks(): OpenApi3Dot2ComponentsObject {
    return {
      callbacks: {
        event: OpenApi3Dot2CallbackObjectFixtures.any,
      },
    };
  }

  public static get withReferenceCallbacks(): OpenApi3Dot2ComponentsObject {
    return {
      callbacks: {
        event: OpenApi3Dot2ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withHeaders(): OpenApi3Dot2ComponentsObject {
    return {
      headers: {
        header: OpenApi3Dot2HeaderObjectFixtures.withSchemaOnly,
      },
    };
  }

  public static get withMediaTypes(): OpenApi3Dot2ComponentsObject {
    return {
      mediaTypes: {
        mediaType: OpenApi3Dot2MediaTypeObjectFixtures.withSchema,
      },
    };
  }

  public static get withReferenceMediaTypes(): OpenApi3Dot2ComponentsObject {
    return {
      mediaTypes: {
        mediaType: OpenApi3Dot2ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withParameters(): OpenApi3Dot2ComponentsObject {
    return {
      parameters: {
        param: OpenApi3Dot2ParameterObjectFixtures.withSchemaOnly,
      },
    };
  }

  public static get withReferenceParameters(): OpenApi3Dot2ComponentsObject {
    return {
      parameters: {
        param: OpenApi3Dot2ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withPathItems(): OpenApi3Dot2ComponentsObject {
    return {
      pathItems: {
        path: OpenApi3Dot2PathItemObjectFixtures.withGetOnly,
      },
    };
  }

  public static get withRequestBodies(): OpenApi3Dot2ComponentsObject {
    return {
      requestBodies: {
        body: OpenApi3Dot2RequestBodyObjectFixtures.any,
      },
    };
  }

  public static get withReferenceRequestBodies(): OpenApi3Dot2ComponentsObject {
    return {
      requestBodies: {
        body: OpenApi3Dot2ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withResponses(): OpenApi3Dot2ComponentsObject {
    return {
      responses: {
        response: OpenApi3Dot2ResponseObjectFixtures.withContentOnly,
      },
    };
  }

  public static get withReferenceResponses(): OpenApi3Dot2ComponentsObject {
    return {
      responses: {
        response: OpenApi3Dot2ReferenceObjectFixtures.any,
      },
    };
  }

  public static get withSchemas(): OpenApi3Dot2ComponentsObject {
    return {
      schemas: {
        schema: OpenApi3Dot2SchemaObjectFixtures.any,
      },
    };
  }
}
