import { HttpAdapter } from '../../models/HttpAdapter.js';
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

export function createTodoControllerSourceModel(
  httpAdapter: HttpAdapter,
): TodoControllerSourceModel {
  switch (httpAdapter) {
    case HttpAdapter.uwebsockets:
      return {
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
        imports: [],
        methodCaptureRequestValues: {},
        methodHeaders: {},
      };
  }
}
