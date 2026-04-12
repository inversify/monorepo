import { type JsonRootSchemaObject } from '@inversifyjs/json-schema-types/2020-12';
import {
  type OpenApi3Dot1CallbackObject,
  type OpenApi3Dot1ComponentsObject,
  type OpenApi3Dot1HeaderObject,
  type OpenApi3Dot1MediaTypeObject,
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ParameterObject,
  type OpenApi3Dot1PathItemObject,
  type OpenApi3Dot1PathsObject,
  type OpenApi3Dot1ReferenceObject,
  type OpenApi3Dot1RequestBodyObject,
  type OpenApi3Dot1ResponseObject,
  type OpenApi3Dot1ResponsesObject,
} from '@inversifyjs/open-api-types/v3Dot1';

export class OpenApi3Dot1Fixtures {
  public static get anyJsonSchema(): JsonRootSchemaObject {
    return { type: 'object' };
  }

  public static get anyMediaTypeObject(): OpenApi3Dot1MediaTypeObject {
    return {
      schema: OpenApi3Dot1Fixtures.anyJsonSchema,
    };
  }

  public static get anyHeaderObject(): OpenApi3Dot1HeaderObject {
    return {
      content: {
        'application/json': OpenApi3Dot1Fixtures.anyMediaTypeObject,
      },
      schema: OpenApi3Dot1Fixtures.anyJsonSchema,
    };
  }

  public static get anyParameterObject(): OpenApi3Dot1ParameterObject {
    return {
      content: {
        'application/json': OpenApi3Dot1Fixtures.anyMediaTypeObject,
      },
      in: 'query',
      name: 'param',
      schema: OpenApi3Dot1Fixtures.anyJsonSchema,
    };
  }

  public static get anyRequestBodyObject(): OpenApi3Dot1RequestBodyObject {
    return {
      content: {
        'application/json': OpenApi3Dot1Fixtures.anyMediaTypeObject,
      },
    };
  }

  public static get anyResponseObject(): OpenApi3Dot1ResponseObject {
    return {
      content: {
        'application/json': OpenApi3Dot1Fixtures.anyMediaTypeObject,
      },
      description: 'description',
      headers: {
        header: OpenApi3Dot1Fixtures.anyHeaderObject,
      },
    };
  }

  public static get anyResponsesObject(): OpenApi3Dot1ResponsesObject {
    return {
      '200': OpenApi3Dot1Fixtures.anyResponseObject,
    };
  }

  public static get anyOperationObject(): OpenApi3Dot1OperationObject {
    return {
      callbacks: {
        event: OpenApi3Dot1Fixtures.anyCallbackObject,
      },
      parameters: [OpenApi3Dot1Fixtures.anyParameterObject],
      requestBody: OpenApi3Dot1Fixtures.anyRequestBodyObject,
      responses: OpenApi3Dot1Fixtures.anyResponsesObject,
    };
  }

  public static get anyPathItemObject(): OpenApi3Dot1PathItemObject {
    return {
      get: OpenApi3Dot1Fixtures.anyOperationObject,
      parameters: [OpenApi3Dot1Fixtures.anyParameterObject],
    };
  }

  public static get anyCallbackObject(): OpenApi3Dot1CallbackObject {
    return {
      '{$request.query.url}': OpenApi3Dot1Fixtures.anyPathItemObject,
    };
  }

  public static get anyPathsObject(): OpenApi3Dot1PathsObject {
    return {
      '/path': OpenApi3Dot1Fixtures.anyPathItemObject,
    };
  }

  public static get anyComponentsObject(): OpenApi3Dot1ComponentsObject {
    return {
      callbacks: {
        event: OpenApi3Dot1Fixtures.anyCallbackObject,
      },
      headers: {
        header: OpenApi3Dot1Fixtures.anyHeaderObject,
      },
      parameters: {
        param: OpenApi3Dot1Fixtures.anyParameterObject,
      },
      pathItems: {
        path: OpenApi3Dot1Fixtures.anyPathItemObject,
      },
      requestBodies: {
        body: OpenApi3Dot1Fixtures.anyRequestBodyObject,
      },
      responses: {
        response: OpenApi3Dot1Fixtures.anyResponseObject,
      },
      schemas: {
        schema: OpenApi3Dot1Fixtures.anyJsonSchema,
      },
    };
  }

  public static get anyObject(): OpenApi3Dot1Object {
    return {
      components: OpenApi3Dot1Fixtures.anyComponentsObject,
      info: { title: 'title', version: '1.0.0' },
      openapi: '3.1.0',
      paths: OpenApi3Dot1Fixtures.anyPathsObject,
      webhooks: {
        event: OpenApi3Dot1Fixtures.anyPathItemObject,
      },
    };
  }

  public static get anyReferenceObject(): OpenApi3Dot1ReferenceObject {
    return {
      $ref: '#/components/schemas/schema',
    };
  }
}
