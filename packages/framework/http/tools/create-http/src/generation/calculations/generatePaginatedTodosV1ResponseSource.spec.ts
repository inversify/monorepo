import { beforeAll, describe, expect, it } from 'vitest';

import { generatePaginatedTodosV1ResponseSource } from './generatePaginatedTodosV1ResponseSource.js';

describe(generatePaginatedTodosV1ResponseSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generatePaginatedTodosV1ResponseSource();
    });

    it('should generate a PaginatedTodosV1Response with TodoV1 items and pagination fields', () => {
      expect(result).toContain("name: 'PaginatedTodosV1Response'");
      expect(result).toContain('export class PaginatedTodosV1Response');
      expect(result).toContain("import { TodoV1 } from './TodoV1.js';");
      expect(result).toContain('items: toSchema(TodoV1)');
      expect(result).toContain('public items!: TodoV1[]');
      expect(result).toContain('public page!: number');
      expect(result).toContain('public pageSize!: number');
      expect(result).toContain('public totalItems!: number');
    });
  });
});
