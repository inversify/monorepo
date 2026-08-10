import { beforeAll, describe, expect, it } from 'vitest';

import { generatePaginatedTodosResponseSource } from './generatePaginatedTodosResponseSource.js';

describe(generatePaginatedTodosResponseSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generatePaginatedTodosResponseSource();
    });

    it('should generate a PaginatedTodosResponse with items and pagination fields', () => {
      expect(result).toContain("name: 'PaginatedTodosResponse'");
      expect(result).toContain('export class PaginatedTodosResponse');
      expect(result).toContain('items: toSchema(Todo)');
      expect(result).toContain('public items!: Todo[]');
      expect(result).toContain('public page!: number');
      expect(result).toContain('public pageSize!: number');
      expect(result).toContain('public totalItems!: number');
    });
  });
});
