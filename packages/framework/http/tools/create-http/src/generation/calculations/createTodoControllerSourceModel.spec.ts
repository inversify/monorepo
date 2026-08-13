import { beforeAll, describe, expect, it } from 'vitest';

import { HttpAdapter } from '../../models/HttpAdapter.js';
import { type TodoControllerSourceModel } from '../models/TodoControllerSourceModel.js';
import { createTodoControllerSourceModel } from './createTodoControllerSourceModel.js';

describe(createTodoControllerSourceModel, () => {
  describe.each([
    HttpAdapter.express,
    HttpAdapter.fastify,
    HttpAdapter.hono,
  ] as const)('having httpAdapter %s', (httpAdapter: HttpAdapter) => {
    describe('when called', () => {
      let result: TodoControllerSourceModel;

      beforeAll(() => {
        result = createTodoControllerSourceModel(httpAdapter);
      });

      it('should return a model without CaptureRequestValues', () => {
        expect(result).toStrictEqual({
          imports: [],
          methodCaptureRequestValues: {},
          methodHeaders: {},
        });
      });
    });
  });

  describe('having httpAdapter uwebsockets', () => {
    describe('when called', () => {
      let result: TodoControllerSourceModel;

      beforeAll(() => {
        result = createTodoControllerSourceModel(HttpAdapter.uwebsockets);
      });

      it('should return a model with CaptureRequestValues for body endpoints and JSON content-type headers', () => {
        expect(result.imports).toStrictEqual([
          {
            moduleSpecifier: '@inversifyjs/http-uwebsockets',
            namedImports: [{ name: 'CaptureRequestValues' }],
          },
        ]);
        expect(result.methodCaptureRequestValues).toStrictEqual({
          createTodo: {
            headers: true,
            method: true,
            url: true,
          },
          updateTodo: {
            headers: true,
            method: true,
            params: ['id'],
            url: true,
          },
        });
        expect(result.methodHeaders).toStrictEqual({
          createTodo: [
            { headerKey: 'Content-Type', value: 'application/json' },
          ],
          getTodo: [{ headerKey: 'Content-Type', value: 'application/json' }],
          listTodos: [{ headerKey: 'Content-Type', value: 'application/json' }],
          updateTodo: [
            { headerKey: 'Content-Type', value: 'application/json' },
          ],
        });
      });
    });
  });
});
