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
  type OpenApi3Dot2ComponentsObject,
  type OpenApi3Dot2HeaderObject,
  type OpenApi3Dot2MediaTypeObject,
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ParameterObject,
  type OpenApi3Dot2PathItemObject,
  type OpenApi3Dot2RequestBodyObject,
  type OpenApi3Dot2ResponseObject,
  type OpenApi3Dot2ResponsesObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2ComponentsObjectFixtures } from '../fixtures/OpenApi3Dot2ComponentsObjectFixtures.js';
import { OpenApi3Dot2HeaderObjectFixtures } from '../fixtures/OpenApi3Dot2HeaderObjectFixtures.js';
import { OpenApi3Dot2MediaTypeObjectFixtures } from '../fixtures/OpenApi3Dot2MediaTypeObjectFixtures.js';
import { OpenApi3Dot2ObjectFixtures } from '../fixtures/OpenApi3Dot2ObjectFixtures.js';
import { OpenApi3Dot2OperationObjectFixtures } from '../fixtures/OpenApi3Dot2OperationObjectFixtures.js';
import { OpenApi3Dot2ParameterObjectFixtures } from '../fixtures/OpenApi3Dot2ParameterObjectFixtures.js';
import { OpenApi3Dot2PathItemObjectFixtures } from '../fixtures/OpenApi3Dot2PathItemObjectFixtures.js';
import { OpenApi3Dot2PathsObjectFixtures } from '../fixtures/OpenApi3Dot2PathsObjectFixtures.js';
import { OpenApi3Dot2RequestBodyObjectFixtures } from '../fixtures/OpenApi3Dot2RequestBodyObjectFixtures.js';
import { OpenApi3Dot2ResponseObjectFixtures } from '../fixtures/OpenApi3Dot2ResponseObjectFixtures.js';
import { OpenApi3Dot2ResponsesObjectFixtures } from '../fixtures/OpenApi3Dot2ResponsesObjectFixtures.js';
import { OpenApi3Dot2SchemaObjectFixtures } from '../fixtures/OpenApi3Dot2SchemaObjectFixtures.js';
import {
  traverseOpenApi3Dot2CallbackObjectJsonSchemas,
  traverseOpenApi3Dot2ComponentsObjectJsonSchemas,
  traverseOpenApi3Dot2HeaderObjectJsonSchemas,
  traverseOpenApi3Dot2MediaTypeObjectJsonSchemas,
  traverseOpenApi3Dot2OperationObjectJsonSchemas,
  traverseOpenApi3Dot2ParameterObjectJsonSchemas,
  traverseOpenApi3Dot2PathItemObjectJsonSchemas,
  traverseOpenApi3Dot2PathsObjectJsonSchemas,
  traverseOpenApi3Dot2RequestBodyObjectJsonSchemas,
  traverseOpenApi3Dot2ResponseObjectJsonSchemas,
  traverseOpenApi3Dot2ResponsesObjectJsonSchemas,
  traverseOpenApiObjectJsonSchemas,
} from './traverse.js';

describe(traverseOpenApi3Dot2MediaTypeObjectJsonSchemas, () => {
  describe('having a media type object with schema', () => {
    let mediaTypeObjectFixture: OpenApi3Dot2MediaTypeObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      mediaTypeObjectFixture = OpenApi3Dot2MediaTypeObjectFixtures.withSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(
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

      traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(
        OpenApi3Dot2MediaTypeObjectFixtures.withoutSchema,
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

  describe('having a media type object with itemSchema', () => {
    let mediaTypeObjectFixture: OpenApi3Dot2MediaTypeObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      mediaTypeObjectFixture =
        OpenApi3Dot2MediaTypeObjectFixtures.withItemSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(
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
          schema: mediaTypeObjectFixture.itemSchema,
        },
        callbackMock,
      );
    });
  });

  describe('having a media type object with itemSchema and schema', () => {
    let mediaTypeObjectFixture: OpenApi3Dot2MediaTypeObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      mediaTypeObjectFixture =
        OpenApi3Dot2MediaTypeObjectFixtures.withItemSchemaAndSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(
        mediaTypeObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for both itemSchema and schema', () => {
      expect(traverse).toHaveBeenCalledTimes(2);
    });

    it('should call traverse() with the itemSchema', () => {
      expect(traverse).toHaveBeenNthCalledWith(
        1,
        {
          jsonPointer: '',
          schema: mediaTypeObjectFixture.itemSchema,
        },
        callbackMock,
      );
    });

    it('should call traverse() with the schema', () => {
      expect(traverse).toHaveBeenNthCalledWith(
        2,
        {
          jsonPointer: '',
          schema: mediaTypeObjectFixture.schema,
        },
        callbackMock,
      );
    });
  });
});

describe(traverseOpenApi3Dot2HeaderObjectJsonSchemas, () => {
  describe('having a header object with content and schema', () => {
    let headerObjectFixture: OpenApi3Dot2HeaderObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      headerObjectFixture =
        OpenApi3Dot2HeaderObjectFixtures.withContentAndSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2HeaderObjectJsonSchemas(
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
          schema: (
            headerObjectFixture.content?.['application/json'] as
              | OpenApi3Dot2MediaTypeObject
              | undefined
          )?.schema,
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
    let headerObjectFixture: OpenApi3Dot2HeaderObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      headerObjectFixture = OpenApi3Dot2HeaderObjectFixtures.withContentOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2HeaderObjectJsonSchemas(
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
          schema: (
            headerObjectFixture.content?.['application/json'] as
              | OpenApi3Dot2MediaTypeObject
              | undefined
          )?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a header object with schema only', () => {
    let headerObjectFixture: OpenApi3Dot2HeaderObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      headerObjectFixture = OpenApi3Dot2HeaderObjectFixtures.withSchemaOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2HeaderObjectJsonSchemas(
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

  describe('having a header object with reference content and schema', () => {
    let headerObjectFixture: OpenApi3Dot2HeaderObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      headerObjectFixture =
        OpenApi3Dot2HeaderObjectFixtures.withReferenceContentAndSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2HeaderObjectJsonSchemas(
        headerObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() only for the header schema', () => {
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

      traverseOpenApi3Dot2HeaderObjectJsonSchemas(
        OpenApi3Dot2HeaderObjectFixtures.withoutContentAndSchema,
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

describe(traverseOpenApi3Dot2ParameterObjectJsonSchemas, () => {
  describe('having a parameter object with content and schema', () => {
    let parameterObjectFixture: OpenApi3Dot2ParameterObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      parameterObjectFixture =
        OpenApi3Dot2ParameterObjectFixtures.withContentAndSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ParameterObjectJsonSchemas(
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
          schema: (
            parameterObjectFixture.content?.['application/json'] as
              | OpenApi3Dot2MediaTypeObject
              | undefined
          )?.schema,
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
    let parameterObjectFixture: OpenApi3Dot2ParameterObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      parameterObjectFixture =
        OpenApi3Dot2ParameterObjectFixtures.withContentOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ParameterObjectJsonSchemas(
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
          schema: (
            parameterObjectFixture.content?.['application/json'] as
              | OpenApi3Dot2MediaTypeObject
              | undefined
          )?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a parameter object with schema only', () => {
    let parameterObjectFixture: OpenApi3Dot2ParameterObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      parameterObjectFixture =
        OpenApi3Dot2ParameterObjectFixtures.withSchemaOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ParameterObjectJsonSchemas(
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

  describe('having a parameter object with reference content and schema', () => {
    let parameterObjectFixture: OpenApi3Dot2ParameterObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      parameterObjectFixture =
        OpenApi3Dot2ParameterObjectFixtures.withReferenceContentAndSchema;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ParameterObjectJsonSchemas(
        parameterObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() only for the parameter schema', () => {
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

      traverseOpenApi3Dot2ParameterObjectJsonSchemas(
        OpenApi3Dot2ParameterObjectFixtures.withoutContentAndSchema,
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

describe(traverseOpenApi3Dot2RequestBodyObjectJsonSchemas, () => {
  describe('having a request body object', () => {
    let requestBodyObjectFixture: OpenApi3Dot2RequestBodyObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      requestBodyObjectFixture = OpenApi3Dot2RequestBodyObjectFixtures.any;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2RequestBodyObjectJsonSchemas(
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
          schema: (
            requestBodyObjectFixture.content['application/json'] as
              | OpenApi3Dot2MediaTypeObject
              | undefined
          )?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a request body object with reference content', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2RequestBodyObjectJsonSchemas(
        OpenApi3Dot2RequestBodyObjectFixtures.withReferenceContent,
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

describe(traverseOpenApi3Dot2ResponseObjectJsonSchemas, () => {
  describe('having a response object with content and headers', () => {
    let responseObjectFixture: OpenApi3Dot2ResponseObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responseObjectFixture =
        OpenApi3Dot2ResponseObjectFixtures.withContentAndHeaders;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ResponseObjectJsonSchemas(
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
          schema: (
            responseObjectFixture.content?.['application/json'] as
              | OpenApi3Dot2MediaTypeObject
              | undefined
          )?.schema,
        },
        callbackMock,
      );
    });

    it('should call traverse() with the header schema', () => {
      const headerObject: OpenApi3Dot2HeaderObject | undefined =
        responseObjectFixture.headers?.['header'];

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
    let responseObjectFixture: OpenApi3Dot2ResponseObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responseObjectFixture =
        OpenApi3Dot2ResponseObjectFixtures.withContentOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ResponseObjectJsonSchemas(
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
          schema: (
            responseObjectFixture.content?.['application/json'] as
              | OpenApi3Dot2MediaTypeObject
              | undefined
          )?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a response object with headers only', () => {
    let responseObjectFixture: OpenApi3Dot2ResponseObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responseObjectFixture =
        OpenApi3Dot2ResponseObjectFixtures.withHeadersOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ResponseObjectJsonSchemas(
        responseObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() once for the header schema', () => {
      const headerObject: OpenApi3Dot2HeaderObject | undefined =
        responseObjectFixture.headers?.['header'];

      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: headerObject?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a response object with reference content and headers', () => {
    let responseObjectFixture: OpenApi3Dot2ResponseObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responseObjectFixture =
        OpenApi3Dot2ResponseObjectFixtures.withReferenceContentAndHeaders;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ResponseObjectJsonSchemas(
        responseObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() only for the header schema', () => {
      const headerObject: OpenApi3Dot2HeaderObject | undefined =
        responseObjectFixture.headers?.['header'];

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

      traverseOpenApi3Dot2ResponseObjectJsonSchemas(
        OpenApi3Dot2ResponseObjectFixtures.withoutContentAndHeaders,
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

describe(traverseOpenApi3Dot2ResponsesObjectJsonSchemas, () => {
  describe('having a responses object with a response', () => {
    let responsesObjectFixture: OpenApi3Dot2ResponsesObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      responsesObjectFixture = OpenApi3Dot2ResponsesObjectFixtures.withResponse;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ResponsesObjectJsonSchemas(
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

      traverseOpenApi3Dot2ResponsesObjectJsonSchemas(
        OpenApi3Dot2ResponsesObjectFixtures.withReferenceResponse,
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

describe(traverseOpenApi3Dot2CallbackObjectJsonSchemas, () => {
  describe('having a callback object with a path item', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2CallbackObjectJsonSchemas(
        {
          '{$request.query.url}': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: OpenApi3Dot2SchemaObjectFixtures.any,
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

describe(traverseOpenApi3Dot2OperationObjectJsonSchemas, () => {
  describe('having an operation object with callbacks', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      operationObjectFixture =
        OpenApi3Dot2OperationObjectFixtures.withCallbacksOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2OperationObjectJsonSchemas(
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

      traverseOpenApi3Dot2OperationObjectJsonSchemas(
        OpenApi3Dot2OperationObjectFixtures.withReferenceCallback,
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
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      operationObjectFixture =
        OpenApi3Dot2OperationObjectFixtures.withParametersOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2OperationObjectJsonSchemas(
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
          schema: OpenApi3Dot2ParameterObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having an operation object with reference parameters', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2OperationObjectJsonSchemas(
        OpenApi3Dot2OperationObjectFixtures.withReferenceParameter,
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
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      operationObjectFixture =
        OpenApi3Dot2OperationObjectFixtures.withRequestBodyOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2OperationObjectJsonSchemas(
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
          schema: (
            OpenApi3Dot2RequestBodyObjectFixtures.any.content[
              'application/json'
            ] as OpenApi3Dot2MediaTypeObject | undefined
          )?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having an operation object with a reference request body', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2OperationObjectJsonSchemas(
        OpenApi3Dot2OperationObjectFixtures.withReferenceRequestBody,
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

      traverseOpenApi3Dot2OperationObjectJsonSchemas(
        OpenApi3Dot2OperationObjectFixtures.withUndefinedRequestBody,
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
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      operationObjectFixture =
        OpenApi3Dot2OperationObjectFixtures.withResponsesOnly;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2OperationObjectJsonSchemas(
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

describe(traverseOpenApi3Dot2PathItemObjectJsonSchemas, () => {
  describe('having a path item object with parameters', () => {
    let pathItemObjectFixture: OpenApi3Dot2PathItemObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      pathItemObjectFixture = OpenApi3Dot2PathItemObjectFixtures.withParameters;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2PathItemObjectJsonSchemas(
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
          schema: OpenApi3Dot2ParameterObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a path item object with reference parameters', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2PathItemObjectJsonSchemas(
        OpenApi3Dot2PathItemObjectFixtures.withReferenceParameter,
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

      traverseOpenApi3Dot2PathItemObjectJsonSchemas(
        OpenApi3Dot2PathItemObjectFixtures.withGetOnly,
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

      traverseOpenApi3Dot2PathItemObjectJsonSchemas(
        OpenApi3Dot2PathItemObjectFixtures.withAllMethods,
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

  describe('having a path item object with additional operations', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2PathItemObjectJsonSchemas(
        OpenApi3Dot2PathItemObjectFixtures.withAdditionalOperations,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for schemas in the additional operations', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: OpenApi3Dot2ParameterObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having an empty path item object', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2PathItemObjectJsonSchemas(
        OpenApi3Dot2PathItemObjectFixtures.empty,
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

describe(traverseOpenApi3Dot2PathsObjectJsonSchemas, () => {
  describe('having a paths object with one path', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2PathsObjectJsonSchemas(
        OpenApi3Dot2PathsObjectFixtures.withOnePath,
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

describe(traverseOpenApi3Dot2ComponentsObjectJsonSchemas, () => {
  describe('having a components object with callbacks', () => {
    let componentsObjectFixture: OpenApi3Dot2ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot2ComponentsObjectFixtures.withCallbacks;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
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

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
        OpenApi3Dot2ComponentsObjectFixtures.withReferenceCallbacks,
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
    let componentsObjectFixture: OpenApi3Dot2ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot2ComponentsObjectFixtures.withHeaders;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
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
          schema: OpenApi3Dot2HeaderObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a components object with media types', () => {
    let componentsObjectFixture: OpenApi3Dot2ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot2ComponentsObjectFixtures.withMediaTypes;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
        componentsObjectFixture,
        callbackMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call traverse() for the media type schema', () => {
      expect(traverse).toHaveBeenCalledExactlyOnceWith(
        {
          jsonPointer: '',
          schema: OpenApi3Dot2MediaTypeObjectFixtures.withSchema.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a components object with reference media types', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
        OpenApi3Dot2ComponentsObjectFixtures.withReferenceMediaTypes,
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

  describe('having a components object with parameters', () => {
    let componentsObjectFixture: OpenApi3Dot2ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot2ComponentsObjectFixtures.withParameters;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
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
          schema: OpenApi3Dot2ParameterObjectFixtures.withSchemaOnly.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a components object with reference parameters', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
        OpenApi3Dot2ComponentsObjectFixtures.withReferenceParameters,
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

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
        OpenApi3Dot2ComponentsObjectFixtures.withPathItems,
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
    let componentsObjectFixture: OpenApi3Dot2ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot2ComponentsObjectFixtures.withRequestBodies;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
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
          schema: (
            OpenApi3Dot2RequestBodyObjectFixtures.any.content[
              'application/json'
            ] as OpenApi3Dot2MediaTypeObject | undefined
          )?.schema,
        },
        callbackMock,
      );
    });
  });

  describe('having a components object with reference request bodies', () => {
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
        OpenApi3Dot2ComponentsObjectFixtures.withReferenceRequestBodies,
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
    let componentsObjectFixture: OpenApi3Dot2ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot2ComponentsObjectFixtures.withResponses;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
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

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
        OpenApi3Dot2ComponentsObjectFixtures.withReferenceResponses,
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
    let componentsObjectFixture: OpenApi3Dot2ComponentsObject;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      componentsObjectFixture =
        OpenApi3Dot2ComponentsObjectFixtures.withSchemas;
      callbackMock = vitest.fn();

      traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
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
          schema: OpenApi3Dot2SchemaObjectFixtures.any,
        },
        callbackMock,
      );
    });
  });
});

describe(traverseOpenApiObjectJsonSchemas, () => {
  describe('having an OpenAPI object with components', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      openApiObjectFixture = OpenApi3Dot2ObjectFixtures.withComponents;
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
    let openApiObjectFixture: OpenApi3Dot2Object;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      openApiObjectFixture = OpenApi3Dot2ObjectFixtures.withPaths;
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
    let openApiObjectFixture: OpenApi3Dot2Object;
    let callbackMock: Mock<(params: TraverseJsonSchemaCallbackParams) => void>;

    beforeAll(() => {
      openApiObjectFixture = OpenApi3Dot2ObjectFixtures.withWebhooks;
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
        OpenApi3Dot2ObjectFixtures.empty,
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
