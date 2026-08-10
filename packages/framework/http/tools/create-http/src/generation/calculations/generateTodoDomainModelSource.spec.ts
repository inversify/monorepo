import { beforeAll, describe, expect, it } from 'vitest';

import { TodoDomainModelSourceFixtures } from '../fixtures/TodoDomainModelSourceFixtures.js';
import { generateTodoDomainModelSource } from './generateTodoDomainModelSource.js';

describe(generateTodoDomainModelSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoDomainModelSourceFixtures.any;
    });

    it('should generate a Todo OpenAPI schema class with the expected fields', () => {
      expect(result).toContain(
        "import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api';",
      );
      expect(result).toContain('export class Todo');
      expect(result).toContain("name: 'Todo'");
      expect(result).toContain('public id!: string;');
      expect(result).toContain('public title!: string;');
      expect(result).toContain('public description!: string;');
      expect(result).toContain('public completed!: boolean;');
      expect(result).toContain('public created_at!: Date;');
      expect(result).toContain('public deleted_at!: Date | null;');
      expect(result).toContain('public updated_at!: Date;');
    });
  });
});
