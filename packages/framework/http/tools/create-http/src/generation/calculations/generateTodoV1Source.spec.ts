import { beforeAll, describe, expect, it } from 'vitest';

import { TodoV1SourceFixtures } from '../fixtures/TodoV1SourceFixtures.js';
import { generateTodoV1Source } from './generateTodoV1Source.js';

describe(generateTodoV1Source, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoV1SourceFixtures.any;
    });

    it('should generate a TodoV1 OpenAPI schema class with camelCase fields', () => {
      expect(result).toContain(
        "import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';",
      );
      expect(result).toContain('export class TodoV1');
      expect(result).toContain("name: 'TodoV1'");
      expect(result).toContain('public id!: string;');
      expect(result).toContain('public title!: string;');
      expect(result).toContain('public description!: string;');
      expect(result).toContain('public completed!: boolean;');
      expect(result).toContain('public createdAt!: Date;');
      expect(result).toContain('public deletedAt!: Date | null;');
      expect(result).toContain('public updatedAt!: Date;');
      expect(result).not.toContain('created_at');
      expect(result).not.toContain('deleted_at');
      expect(result).not.toContain('updated_at');
    });
  });
});
