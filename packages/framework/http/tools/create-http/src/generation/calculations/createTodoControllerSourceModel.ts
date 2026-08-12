import { type HttpAdapter } from '../../models/HttpAdapter.js';
import {
  type CaptureRequestValuesSourceModel,
  type TodoControllerMethodName,
  type TodoControllerSourceModel,
} from '../models/TodoControllerSourceModel.js';

const UWEBSOCKETS_METHOD_CAPTURE_REQUEST_VALUES: Readonly<
  Record<TodoControllerMethodName, CaptureRequestValuesSourceModel>
> = {
  // ValidatedBody reads content-type headers, method, and url after awaiting body.
  createTodo: {
    headers: true,
    method: true,
    url: true,
  },
  // ValidatedParams reads method, url, and path params.
  deleteTodo: {
    method: true,
    params: ['id'],
    url: true,
  },
  getTodo: {
    method: true,
    params: ['id'],
    url: true,
  },
  // ValidatedQuery reads method, url, and query.
  listTodos: {
    method: true,
    query: true,
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

export function createTodoControllerSourceModel(
  httpAdapter: HttpAdapter,
): TodoControllerSourceModel {
  if (httpAdapter !== 'uwebsockets') {
    return {
      imports: [],
      methodCaptureRequestValues: {},
    };
  }

  return {
    imports: [
      {
        moduleSpecifier: '@inversifyjs/http-uwebsockets',
        namedImports: [{ name: 'CaptureRequestValues' }],
      },
    ],
    methodCaptureRequestValues: UWEBSOCKETS_METHOD_CAPTURE_REQUEST_VALUES,
  };
}
