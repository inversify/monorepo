import { beforeAll, describe, expect, it } from 'vitest';

import { generateTodoSchemaV1Source } from './generateTodoSchemaV1Source.js';

describe(generateTodoSchemaV1Source, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateTodoSchemaV1Source();
    });

    it('should generate a TodoV1 JSON schema with date-time fields', () => {
      expect(result).toContain('export const todoSchemaV1');
      expect(result).toContain("format: 'uuid'");
      expect(result).toContain("format: 'date-time'");
      expect(result).toContain("type: ['string', 'null']");
      expect(result).not.toContain('created_at');
    });
  });
});
