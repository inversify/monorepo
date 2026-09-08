import { beforeAll, describe, expect, it } from 'vitest';

import { generatePaginatedTodosV1ResponseSchemaSource } from './generatePaginatedTodosV1ResponseSchemaSource.js';

describe(generatePaginatedTodosV1ResponseSchemaSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generatePaginatedTodosV1ResponseSchemaSource();
    });

    it('should generate a paginated response schema that $refs TodoV1', () => {
      expect(result).toContain('export const paginatedTodosV1ResponseSchema');
      expect(result).toContain("$ref: '#/components/schemas/TodoV1'");
      expect(result).toContain('pageSize');
    });
  });
});
