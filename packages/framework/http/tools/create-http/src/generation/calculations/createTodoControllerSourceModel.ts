import { ApiStyle } from '../../models/ApiStyle.js';
import { HttpAdapter } from '../../models/HttpAdapter.js';
import { type SourceImport } from '../models/BootstrapSourceModel.js';
import { OpenApiSchemaBindingKind } from '../models/OpenApiSchemaBindingKind.js';
import {
  type CaptureRequestValuesSourceModel,
  type SetHeaderSourceModel,
  type TodoControllerMethodName,
  type TodoControllerSourceModel,
} from '../models/TodoControllerSourceModel.js';

const JSON_CONTENT_TYPE_HEADER: SetHeaderSourceModel = {
  headerKey: 'Content-Type',
  value: 'application/json',
};

const UWEBSOCKETS_METHOD_CAPTURE_REQUEST_VALUES: Readonly<
  Partial<Record<TodoControllerMethodName, CaptureRequestValuesSourceModel>>
> = {
  // ValidatedBody reads content-type headers, method, and url after awaiting body.
  createTodo: {
    headers: true,
    method: true,
    url: true,
  },
  // ValidatedParams + ValidatedBody need params, headers, method, and url.
  updateTodo: {
    headers: true,
    method: true,
    params: ['id'],
    url: true,
  },
};

const UWEBSOCKETS_METHOD_HEADERS: Readonly<
  Partial<Record<TodoControllerMethodName, readonly SetHeaderSourceModel[]>>
> = {
  createTodo: [JSON_CONTENT_TYPE_HEADER],
  getTodo: [JSON_CONTENT_TYPE_HEADER],
  listTodos: [JSON_CONTENT_TYPE_HEADER],
  updateTodo: [JSON_CONTENT_TYPE_HEADER],
};

const CODE_FIRST_API_TYPE_IMPORTS: readonly SourceImport[] = [
  {
    moduleSpecifier: '../models/CreateTodoV1RequestBody.js',
    namedImports: [{ name: 'CreateTodoV1RequestBody' }],
  },
  {
    moduleSpecifier: '../models/PaginatedTodosV1Response.js',
    namedImports: [{ name: 'PaginatedTodosV1Response' }],
  },
  {
    moduleSpecifier: '../models/TodoV1.js',
    namedImports: [{ name: 'TodoV1' }],
  },
  {
    moduleSpecifier: '../models/UpdateTodoV1RequestBody.js',
    namedImports: [{ name: 'UpdateTodoV1RequestBody' }],
  },
];

const SCHEMA_FIRST_API_TYPE_IMPORTS: readonly SourceImport[] = [
  {
    isTypeOnly: true,
    moduleSpecifier: '../../../generated/api/index.js',
    namedImports: [
      { name: 'CreateTodoV1RequestBody' },
      { name: 'PaginatedTodosV1Response' },
      { name: 'TodoV1' },
      { name: 'UpdateTodoV1RequestBody' },
    ],
  },
];

function createApiTypeSourceModel(
  apiStyle: ApiStyle,
): Pick<
  TodoControllerSourceModel,
  'apiTypeImports' | 'openApiSchemaBindingKind'
> {
  if (apiStyle === ApiStyle.schemaFirst) {
    return {
      apiTypeImports: SCHEMA_FIRST_API_TYPE_IMPORTS,
      openApiSchemaBindingKind: OpenApiSchemaBindingKind.componentRef,
    };
  }

  return {
    apiTypeImports: CODE_FIRST_API_TYPE_IMPORTS,
    openApiSchemaBindingKind: OpenApiSchemaBindingKind.toSchema,
  };
}

export function createTodoControllerSourceModel(
  httpAdapter: HttpAdapter,
  apiStyle: ApiStyle,
): TodoControllerSourceModel {
  const apiTypeSourceModel: Pick<
    TodoControllerSourceModel,
    'apiTypeImports' | 'openApiSchemaBindingKind'
  > = createApiTypeSourceModel(apiStyle);

  switch (httpAdapter) {
    case HttpAdapter.uwebsockets:
      return {
        ...apiTypeSourceModel,
        imports: [
          {
            moduleSpecifier: '@inversifyjs/http-uwebsockets',
            namedImports: [{ name: 'CaptureRequestValues' }],
          },
        ],
        methodCaptureRequestValues: UWEBSOCKETS_METHOD_CAPTURE_REQUEST_VALUES,
        methodHeaders: UWEBSOCKETS_METHOD_HEADERS,
      };
    default:
      return {
        ...apiTypeSourceModel,
        imports: [],
        methodCaptureRequestValues: {},
        methodHeaders: {},
      };
  }
}
