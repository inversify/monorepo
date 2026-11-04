import { beforeAll, describe, expect, it } from 'vitest';

import { generateInitialApiTypesSource } from './generateInitialApiTypesSource.js';

describe(generateInitialApiTypesSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateInitialApiTypesSource();
    });

    it('should stub named generated types with their stock shapes', () => {
      expect(result).toContain('export type StatusV1 = {');
      expect(result).toContain('status: string;');
      expect(result).toContain('export type TodoV1 = {');
      expect(result).toContain('deletedAt: string | null;');
      expect(result).toContain('export type CreateTodoV1RequestBody = {');
      expect(result).toContain('export type PaginatedTodosV1Response = {');
      expect(result).toContain('items: TodoV1[];');
      expect(result).toContain('export type UpdateTodoV1RequestBody = {');
      expect(result).toContain('title?: string;');
      expect(result).toContain('export type Root =');
      expect(result).toContain('| UpdateTodoV1RequestBody;');
      expect(result).not.toContain('any');
    });
  });
});
