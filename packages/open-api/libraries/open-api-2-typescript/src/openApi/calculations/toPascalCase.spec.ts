import { beforeAll, describe, expect, it } from 'vitest';

import { toPascalCase } from './toPascalCase.js';

describe(toPascalCase, () => {
  describe.each<[string, string, string]>([
    ['an empty string', '', ''],
    ['a camelCase operationId', 'listTodos', 'ListTodos'],
    ['a kebab-case operationId', 'get-todo-by-id', 'GetTodoById'],
    ['an HTTP method and path', 'get /v1/todos/{id}', 'GetV1TodosId'],
    ['an acronym followed by a word', 'HTTPResponse', 'HttpResponse'],
    ['a string of separators', '///{}', ''],
  ])('having %s', (_: string, valueFixture: string, expected: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toPascalCase(valueFixture);
      });

      it('should return the expected PascalCase string', () => {
        expect(result).toBe(expected);
      });
    });
  });
});
