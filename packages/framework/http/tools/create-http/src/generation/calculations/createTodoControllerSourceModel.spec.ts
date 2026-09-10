import { beforeAll, describe, expect, it } from 'vitest';

import { ApiStyle } from '../../models/ApiStyle.js';
import { HttpAdapter } from '../../models/HttpAdapter.js';
import { OpenApiSchemaBindingKind } from '../models/OpenApiSchemaBindingKind.js';
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
        result = createTodoControllerSourceModel(
          httpAdapter,
          ApiStyle.codeFirst,
        );
      });

      it('should return a model without CaptureRequestValues', () => {
        expect(result.imports).toStrictEqual([]);
        expect(result.methodCaptureRequestValues).toStrictEqual({});
        expect(result.methodHeaders).toStrictEqual({});
        expect(result.openApiSchemaBindingKind).toBe(
          OpenApiSchemaBindingKind.toSchema,
        );
        expect(result.apiTypeImports).toStrictEqual([
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
        ]);
      });
    });
  });

  describe('having httpAdapter uwebsockets', () => {
    describe('when called', () => {
      let result: TodoControllerSourceModel;

      beforeAll(() => {
        result = createTodoControllerSourceModel(
          HttpAdapter.uwebsockets,
          ApiStyle.codeFirst,
        );
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

  describe('having httpAdapter express and schema-first', () => {
    describe('when called', () => {
      let result: TodoControllerSourceModel;

      beforeAll(() => {
        result = createTodoControllerSourceModel(
          HttpAdapter.express,
          ApiStyle.schemaFirst,
        );
      });

      it('should bind schemas by component $ref and import generated types', () => {
        expect(result.openApiSchemaBindingKind).toBe(
          OpenApiSchemaBindingKind.componentRef,
        );
        expect(result.apiTypeImports).toStrictEqual([
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
        ]);
      });
    });
  });
});
