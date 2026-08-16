import { beforeAll, describe, expect, it } from 'vitest';

import { TodoFromPrismaTodoBuilderSourceFixtures } from '../fixtures/TodoFromPrismaTodoBuilderSourceFixtures.js';
import { generateTodoFromPrismaTodoBuilderSource } from './generateTodoFromPrismaTodoBuilderSource.js';

describe(generateTodoFromPrismaTodoBuilderSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoFromPrismaTodoBuilderSourceFixtures.any;
    });

    it('should generate a Builder from PrismaTodo to Todo', () => {
      expect(result).toContain("import { injectable } from 'inversify';");
      expect(result).toContain(
        "import { type Builder } from '../../../../common/domain/modules/Builder.js';",
      );
      expect(result).toContain(
        "import { type Todo as PrismaTodo } from '../../../../generated/prisma/client.js';",
      );
      expect(result).toContain(
        "import { type Todo } from '../../../domain/models/Todo.js';",
      );
      expect(result).toContain(
        'export class TodoFromPrismaTodoBuilder implements Builder<PrismaTodo, Todo>',
      );
      expect(result).toContain('public build(input: PrismaTodo): Todo');
      expect(result).toContain('createdAt: input.created_at');
      expect(result).toContain('deletedAt: input.deleted_at');
      expect(result).toContain('updatedAt: input.updated_at');
    });
  });
});
