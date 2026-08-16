import { beforeAll, describe, expect, it } from 'vitest';

import { TodoDomainModelSourceFixtures } from '../fixtures/TodoDomainModelSourceFixtures.js';
import { generateTodoDomainModelSource } from './generateTodoDomainModelSource.js';

describe(generateTodoDomainModelSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoDomainModelSourceFixtures.any;
    });

    it('should generate a Todo class with camelCase fields', () => {
      expect(result).toContain('export class Todo');
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
      expect(result).not.toContain('@inversifyjs/http-open-api');
    });
  });
});
