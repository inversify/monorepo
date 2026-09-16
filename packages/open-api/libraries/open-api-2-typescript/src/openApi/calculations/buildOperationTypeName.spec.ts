import { beforeAll, describe, expect, it } from 'vitest';

import { buildOperationTypeName } from './buildOperationTypeName.js';

describe(buildOperationTypeName, () => {
  describe('having an operationId', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildOperationTypeName('listTodos', 'get', '/v1/todos');
      });

      it('should return the PascalCase operationId', () => {
        expect(result).toBe('ListTodos');
      });
    });
  });

  describe('having a kebab-case operationId', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildOperationTypeName('get-todo-by-id', 'get', '/todos/{id}');
      });

      it('should return the PascalCase operationId', () => {
        expect(result).toBe('GetTodoById');
      });
    });
  });

  describe('having an empty operationId', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildOperationTypeName('', 'get', '/v1/todos/{id}');
      });

      it('should return the PascalCase method and path', () => {
        expect(result).toBe('GetV1TodosId');
      });
    });
  });

  describe('having an operationId of separators', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildOperationTypeName('///', 'get', '/v1/todos/{id}');
      });

      it('should return the PascalCase method and path', () => {
        expect(result).toBe('GetV1TodosId');
      });
    });
  });

  describe('having no operationId', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildOperationTypeName(undefined, 'get', '/v1/todos/{id}');
      });

      it('should return the PascalCase method and path', () => {
        expect(result).toBe('GetV1TodosId');
      });
    });
  });

  describe('having no operationId and a path of separators', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildOperationTypeName(undefined, '', '///');
      });

      it('should return the fallback operation name', () => {
        expect(result).toBe('Operation');
      });
    });
  });
});
