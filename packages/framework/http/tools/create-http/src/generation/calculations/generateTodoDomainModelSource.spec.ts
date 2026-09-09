import { beforeAll, describe, expect, it } from 'vitest';

import { TodoDomainModelSourceFixtures } from '../fixtures/TodoDomainModelSourceFixtures.js';
import { generateTodoDomainModelSource } from './generateTodoDomainModelSource.js';

describe(generateTodoDomainModelSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoDomainModelSourceFixtures.any;
    });

    it('should generate a Todo interface with camelCase fields', () => {
      expect(result).toContain('export interface Todo');
      expect(result).toContain('id: string;');
      expect(result).toContain('title: string;');
      expect(result).toContain('description: string;');
      expect(result).toContain('completed: boolean;');
      expect(result).toContain('createdAt: Date;');
      expect(result).toContain('deletedAt: Date | null;');
      expect(result).toContain('updatedAt: Date;');
      expect(result).not.toContain('export class Todo');
      expect(result).not.toContain('created_at');
      expect(result).not.toContain('deleted_at');
      expect(result).not.toContain('updated_at');
      expect(result).not.toContain('@inversifyjs/http-open-api');
    });
  });
});
