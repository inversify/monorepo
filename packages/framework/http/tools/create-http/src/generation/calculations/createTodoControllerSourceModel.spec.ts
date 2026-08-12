import { beforeAll, describe, expect, it } from 'vitest';

import { type TodoControllerSourceModel } from '../models/TodoControllerSourceModel.js';
import { createTodoControllerSourceModel } from './createTodoControllerSourceModel.js';

describe(createTodoControllerSourceModel, () => {
  describe.each(['express', 'fastify', 'hono'] as const)(
    'having httpAdapter %s',
    (httpAdapter: 'express' | 'fastify' | 'hono') => {
      describe('when called', () => {
        let result: TodoControllerSourceModel;

        beforeAll(() => {
          result = createTodoControllerSourceModel(httpAdapter);
        });

        it('should return a model without CaptureRequestValues', () => {
          expect(result).toStrictEqual({
            imports: [],
            methodCaptureRequestValues: {},
          });
        });
      });
    },
  );

  describe('having httpAdapter uwebsockets', () => {
    describe('when called', () => {
      let result: TodoControllerSourceModel;

      beforeAll(() => {
        result = createTodoControllerSourceModel('uwebsockets');
      });

      it('should return a model with CaptureRequestValues for validated endpoints', () => {
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
          listTodos: {
            method: true,
            query: true,
            url: true,
          },
          updateTodo: {
            headers: true,
            method: true,
            params: ['id'],
            url: true,
          },
        });
      });
    });
  });
});
