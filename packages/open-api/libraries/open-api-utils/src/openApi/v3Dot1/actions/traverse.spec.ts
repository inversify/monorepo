import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/json-schema-utils/2020-12'));

import {
  traverse,
  type TraverseJsonSchemaCallbackParams,
} from '@inversifyjs/json-schema-utils/2020-12';
import {
  type OpenApi3Dot1ComponentsObject,
  type OpenApi3Dot1HeaderObject,
  type OpenApi3Dot1MediaTypeObject,
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ParameterObject,
  type OpenApi3Dot1PathItemObject,
  type OpenApi3Dot1RequestBodyObject,
  type OpenApi3Dot1ResponseObject,
  type OpenApi3Dot1ResponsesObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1ComponentsObjectFixtures } from '../fixtures/OpenApi3Dot1ComponentsObjectFixtures.js';
import { OpenApi3Dot1HeaderObjectFixtures } from '../fixtures/OpenApi3Dot1HeaderObjectFixtures.js';
import { OpenApi3Dot1MediaTypeObjectFixtures } from '../fixtures/OpenApi3Dot1MediaTypeObjectFixtures.js';
import { OpenApi3Dot1ObjectFixtures } from '../fixtures/OpenApi3Dot1ObjectFixtures.js';
import { OpenApi3Dot1OperationObjectFixtures } from '../fixtures/OpenApi3Dot1OperationObjectFixtures.js';
import { OpenApi3Dot1ParameterObjectFixtures } from '../fixtures/OpenApi3Dot1ParameterObjectFixtures.js';
import { OpenApi3Dot1PathItemObjectFixtures } from '../fixtures/OpenApi3Dot1PathItemObjectFixtures.js';
import { OpenApi3Dot1PathsObjectFixtures } from '../fixtures/OpenApi3Dot1PathsObjectFixtures.js';
import { OpenApi3Dot1RequestBodyObjectFixtures } from '../fixtures/OpenApi3Dot1RequestBodyObjectFixtures.js';
import { OpenApi3Dot1ResponseObjectFixtures } from '../fixtures/OpenApi3Dot1ResponseObjectFixtures.js';
import { OpenApi3Dot1ResponsesObjectFixtures } from '../fixtures/OpenApi3Dot1ResponsesObjectFixtures.js';
import { OpenApi3Dot1SchemaObjectFixtures } from '../fixtures/OpenApi3Dot1SchemaObjectFixtures.js';
import {
  traverseOpenApi3Dot1CallbackObjectJsonSchemas,
  traverseOpenApi3Dot1ComponentsObjectJsonSchemas,
  traverseOpenApi3Dot1HeaderObjectJsonSchemas,
  traverseOpenApi3Dot1MediaTypeObjectJsonSchemas,
  traverseOpenApi3Dot1OperationObjectJsonSchemas,
  traverseOpenApi3Dot1ParameterObjectJsonSchemas,
  traverseOpenApi3Dot1PathItemObjectJsonSchemas,
  traverseOpenApi3Dot1PathsObjectJsonSchemas,
  traverseOpenApi3Dot1RequestBodyObjectJsonSchemas,
  traverseOpenApi3Dot1ResponseObjectJsonSchemas,
  traverseOpenApi3Dot1ResponsesObjectJsonSchemas,
  traverseOpenApiObjectJsonSchemas,
} from './traverse.js';

describe(traverseOpenApi3Dot1MediaTypeObjectJsonSchemas, () => {
  describe('having a media type object with schema', () => {
    let mediaTypeObjectFixture: OpenApi3Dot1MediaTypeObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      mediaTypeObjectFixture = OpenApi3Dot1MediaTypeObjectFixtures.withSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(
        mediaTypeObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse()', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: mediaTypeObjectFixture.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a media type object without schema', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(
        OpenApi3Dot1MediaTypeObjectFixtures.withoutSchema,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });
});

describe(traverseOpenApi3Dot1HeaderObjectJsonSchemas, () => {
  describe('having a header object with content and schema', () => {
    let headerObjectFixture: OpenApi3Dot1HeaderObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      headerObjectFixture =
        OpenApi3Dot1HeaderObjectFixtures.withContentAndSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1HeaderObjectJsonSchemas(
        headerObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for content media type schema and header schema', () => {
      expect(traverse).toHaveBeenCalledTimes(2);
    });

    it('should call traverse() with the content media type schema', () => {
      expect(traverse).toHaveBeenNthCalledWith(
        1,
        {
          jsonPointer: '',
          schema: headerObjectFixture.content?.['application/json']?.schema,
        },
        callbackMock,
      );
    });

    it('should call traverse() with the header schema', () => {
      expect(traverse).toHaveBeenNthCalledWith(
        2,
        {
          jsonPointer: '',
          schema: headerObjectFixture.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a header object with content only', () => {
    let headerObjectFixture: OpenApi3Dot1HeaderObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      headerObjectFixture = OpenApi3Dot1HeaderObjectFixtures.withContentOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1HeaderObjectJsonSchemas(
        headerObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() once for the content media type schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: headerObjectFixture.content?.['application/json']?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a header object with schema only', () => {
    let headerObjectFixture: OpenApi3Dot1HeaderObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      headerObjectFixture = OpenApi3Dot1HeaderObjectFixtures.withSchemaOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1HeaderObjectJsonSchemas(
        headerObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() once for the header schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: headerObjectFixture.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a header object without content and schema', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1HeaderObjectJsonSchemas(
        OpenApi3Dot1HeaderObjectFixtures.withoutContentAndSchema,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });
});

describe(traverseOpenApi3Dot1ParameterObjectJsonSchemas, () => {
  describe('having a parameter object with content and schema', () => {
    let parameterObjectFixture: OpenApi3Dot1ParameterObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      parameterObjectFixture =
        OpenApi3Dot1ParameterObjectFixtures.withContentAndSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ParameterObjectJsonSchemas(
        parameterObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for content media type schema and parameter schema', () => {
      expect(traverse).toHaveBeenCalledTimes(2);
    });

    it('should call traverse() with the content media type schema', () => {
      expect(traverse).toHaveBeenNthCalledWith(
        1,
        {
          jsonPointer: '',
          schema: parameterObjectFixture.content?.['application/json']?.schema,
        },
        callbackMock,
      );
    });

    it('should call traverse() with the parameter schema', () => {
      expect(traverse).toHaveBeenNthCalledWith(
        2,
        {
          jsonPointer: '',
          schema: parameterObjectFixture.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a parameter object with content only', () => {
    let parameterObjectFixture: OpenApi3Dot1ParameterObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      parameterObjectFixture =
        OpenApi3Dot1ParameterObjectFixtures.withContentOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ParameterObjectJsonSchemas(
        parameterObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() once for the content media type schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: parameterObjectFixture.content?.['application/json']?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a parameter object with schema only', () => {
    let parameterObjectFixture: OpenApi3Dot1ParameterObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      parameterObjectFixture =
        OpenApi3Dot1ParameterObjectFixtures.withSchemaOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ParameterObjectJsonSchemas(
        parameterObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() once for the parameter schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: parameterObjectFixture.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a parameter object without content and schema', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ParameterObjectJsonSchemas(
        OpenApi3Dot1ParameterObjectFixtures.withoutContentAndSchema,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });
});

describe(traverseOpenApi3Dot1RequestBodyObjectJsonSchemas, () => {
  describe('having a request body object', () => {
    let requestBodyObjectFixture: OpenApi3Dot1RequestBodyObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      requestBodyObjectFixture = OpenApi3Dot1RequestBodyObjectFixtures.any;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1RequestBodyObjectJsonSchemas(
        requestBodyObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for each content media type schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: requestBodyObjectFixture.content['application/json']?.schema,
        },
        callbackMock,
      );
    });
  });
});

describe(traverseOpenApi3Dot1ResponseObjectJsonSchemas, () => {
  describe('having a response object with content and headers', () => {
    let responseObjectFixture: OpenApi3Dot1ResponseObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responseObjectFixture =
        OpenApi3Dot1ResponseObjectFixtures.withContentAndHeaders;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ResponseObjectJsonSchemas(
        responseObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for the content media type schema and header schema', () => {
      expect(traverse).toHaveBeenCalledTimes(2);
    });

    it('should call traverse() with the content media type schema', () => {
      expect(traverse).toHaveBeenNthCalledWith(
        1,
        {
          jsonPointer: '',
          schema: responseObjectFixture.content?.['application/json']?.schema,
        },
        callbackMock,
      );
    });

    it('should call traverse() with the header schema', () => {
      const headerObject: OpenApi3Dot1HeaderObject | undefined =
        responseObjectFixture.headers?.['header'] as
          | OpenApi3Dot1HeaderObject
          | undefined;

      expect(traverse).toHaveBeenNthCalledWith(
        2,
        {
          jsonPointer: '',
          schema: headerObject?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a response object with content only', () => {
    let responseObjectFixture: OpenApi3Dot1ResponseObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responseObjectFixture =
        OpenApi3Dot1ResponseObjectFixtures.withContentOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ResponseObjectJsonSchemas(
        responseObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() once for the content media type schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: responseObjectFixture.content?.['application/json']?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a response object with headers only', () => {
    let responseObjectFixture: OpenApi3Dot1ResponseObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responseObjectFixture =
        OpenApi3Dot1ResponseObjectFixtures.withHeadersOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ResponseObjectJsonSchemas(
        responseObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() once for the header schema', () => {
      const headerObject: OpenApi3Dot1HeaderObject | undefined =
        responseObjectFixture.headers?.['header'] as
          | OpenApi3Dot1HeaderObject
          | undefined;

      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: headerObject?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a response object without content and headers', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ResponseObjectJsonSchemas(
        OpenApi3Dot1ResponseObjectFixtures.withoutContentAndHeaders,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });
});

describe(traverseOpenApi3Dot1ResponsesObjectJsonSchemas, () => {
  describe('having a responses object with a response', () => {
    let responsesObjectFixture: OpenApi3Dot1ResponsesObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responsesObjectFixture = OpenApi3Dot1ResponsesObjectFixtures.withResponse;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ResponsesObjectJsonSchemas(
        responsesObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse()', () => {
      expect(traverse).toHaveBeenCalledTimes(2);
    });
  });

  describe('having a responses object with a reference response', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ResponsesObjectJsonSchemas(
        OpenApi3Dot1ResponsesObjectFixtures.withReferenceResponse,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });
});

describe(traverseOpenApi3Dot1CallbackObjectJsonSchemas, () => {
  describe('having a callback object with a path item', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1CallbackObjectJsonSchemas(
        {
          '{$request.query.url}': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: OpenApi3Dot1SchemaObjectFixtures.any,
                    },
                  },
                  description: 'description',
                },
              },
            },
          },
        },
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for schemas in the path item', () => {
      expect(traverse).toHaveBeenCalledTimes(1);
    });
  });
});

describe(traverseOpenApi3Dot1OperationObjectJsonSchemas, () => {
  describe('having an operation object with callbacks', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      operationObjectFixture =
        OpenApi3Dot1OperationObjectFixtures.withCallbacksOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1OperationObjectJsonSchemas(
        operationObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for schemas in the callbacks', () => {
      expect(traverse).toHaveBeenCalledTimes(2);
    });
  });

  describe('having an operation object with reference callbacks', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1OperationObjectJsonSchemas(
        OpenApi3Dot1OperationObjectFixtures.withReferenceCallback,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having an operation object with parameters', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      operationObjectFixture =
        OpenApi3Dot1OperationObjectFixtures.withParametersOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1OperationObjectJsonSchemas(
        operationObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for the parameter schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: OpenApi3Dot1ParameterObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having an operation object with reference parameters', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1OperationObjectJsonSchemas(
        OpenApi3Dot1OperationObjectFixtures.withReferenceParameter,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having an operation object with a request body', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      operationObjectFixture =
        OpenApi3Dot1OperationObjectFixtures.withRequestBodyOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1OperationObjectJsonSchemas(
        operationObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for the request body content media type schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema:
            OpenApi3Dot1RequestBodyObjectFixtures.any.content[
              'application/json'
            ]?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having an operation object with a reference request body', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1OperationObjectJsonSchemas(
        OpenApi3Dot1OperationObjectFixtures.withReferenceRequestBody,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having an operation object with undefined request body', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1OperationObjectJsonSchemas(
        OpenApi3Dot1OperationObjectFixtures.withUndefinedRequestBody,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having an operation object with responses', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      operationObjectFixture =
        OpenApi3Dot1OperationObjectFixtures.withResponsesOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1OperationObjectJsonSchemas(
        operationObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for schemas in the responses', () => {
      expect(traverse).toHaveBeenCalledTimes(2);
    });
  });
});

describe(traverseOpenApi3Dot1PathItemObjectJsonSchemas, () => {
  describe('having a path item object with parameters', () => {
    let pathItemObjectFixture: OpenApi3Dot1PathItemObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      pathItemObjectFixture = OpenApi3Dot1PathItemObjectFixtures.withParameters;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1PathItemObjectJsonSchemas(
        pathItemObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for the parameter schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: OpenApi3Dot1ParameterObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a path item object with reference parameters', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1PathItemObjectJsonSchemas(
        OpenApi3Dot1PathItemObjectFixtures.withReferenceParameter,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having a path item object with a get operation', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1PathItemObjectJsonSchemas(
        OpenApi3Dot1PathItemObjectFixtures.withGetOnly,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse() when the operation is empty', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having a path item object with all HTTP methods', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1PathItemObjectJsonSchemas(
        OpenApi3Dot1PathItemObjectFixtures.withAllMethods,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse() when all operations are empty', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having an empty path item object', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1PathItemObjectJsonSchemas(
        OpenApi3Dot1PathItemObjectFixtures.empty,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });
});

describe(traverseOpenApi3Dot1PathsObjectJsonSchemas, () => {
  describe('having a paths object with one path', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1PathsObjectJsonSchemas(
        OpenApi3Dot1PathsObjectFixtures.withOnePath,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse() when the path item operation is empty', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });
});

describe(traverseOpenApi3Dot1ComponentsObjectJsonSchemas, () => {
  describe('having a components object with callbacks', () => {
    let componentsObjectFixture: OpenApi3Dot1ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot1ComponentsObjectFixtures.withCallbacks;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        componentsObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for schemas in the callbacks', () => {
      expect(traverse).toHaveBeenCalledTimes(1);
    });
  });

  describe('having a components object with reference callbacks', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        OpenApi3Dot1ComponentsObjectFixtures.withReferenceCallbacks,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having a components object with headers', () => {
    let componentsObjectFixture: OpenApi3Dot1ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot1ComponentsObjectFixtures.withHeaders;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        componentsObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for the header schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: OpenApi3Dot1HeaderObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a components object with parameters', () => {
    let componentsObjectFixture: OpenApi3Dot1ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot1ComponentsObjectFixtures.withParameters;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        componentsObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for the parameter schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: OpenApi3Dot1ParameterObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a components object with reference parameters', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        OpenApi3Dot1ComponentsObjectFixtures.withReferenceParameters,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having a components object with path items', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        OpenApi3Dot1ComponentsObjectFixtures.withPathItems,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse() when the path item operation is empty', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having a components object with request bodies', () => {
    let componentsObjectFixture: OpenApi3Dot1ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot1ComponentsObjectFixtures.withRequestBodies;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        componentsObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for the request body content media type schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema:
            OpenApi3Dot1RequestBodyObjectFixtures.any.content[
              'application/json'
            ]?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a components object with reference request bodies', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        OpenApi3Dot1ComponentsObjectFixtures.withReferenceRequestBodies,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having a components object with responses', () => {
    let componentsObjectFixture: OpenApi3Dot1ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot1ComponentsObjectFixtures.withResponses;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        componentsObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for schemas in the response', () => {
      expect(traverse).toHaveBeenCalledTimes(1);
    });
  });

  describe('having a components object with reference responses', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        OpenApi3Dot1ComponentsObjectFixtures.withReferenceResponses,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having a components object with schemas', () => {
    let componentsObjectFixture: OpenApi3Dot1ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot1ComponentsObjectFixtures.withSchemas;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
        componentsObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for each schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: OpenApi3Dot1SchemaObjectFixtures.any,
        },
        callbackMock,
      );
    });
  });
});

describe(traverseOpenApiObjectJsonSchemas, () => {
  describe('having an OpenAPI object with components', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      openApiObjectFixture = OpenApi3Dot1ObjectFixtures.withComponents;
      callbackMock = vitest.fn();

      traverseOpenApiObjectJsonSchemas(openApiObjectFixture, callbackMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for schemas in the components', () => {
      expect(traverse).toHaveBeenCalledTimes(1);
    });
  });

  describe('having an OpenAPI object with paths', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      openApiObjectFixture = OpenApi3Dot1ObjectFixtures.withPaths;
      callbackMock = vitest.fn();

      traverseOpenApiObjectJsonSchemas(openApiObjectFixture, callbackMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse() when the path item operation is empty', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having an OpenAPI object with webhooks', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      openApiObjectFixture = OpenApi3Dot1ObjectFixtures.withWebhooks;
      callbackMock = vitest.fn();

      traverseOpenApiObjectJsonSchemas(openApiObjectFixture, callbackMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse() when the webhook path item operation is empty', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });

  describe('having an empty OpenAPI object', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApiObjectJsonSchemas(
        OpenApi3Dot1ObjectFixtures.empty,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call traverse()', () => {
      expect(traverse).not.toHaveBeenCalled();
    });
  });
});
