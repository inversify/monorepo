import { beforeAll, describe, expect, it } from 'vitest';

import { TodoV1FromTodoBuilderSourceFixtures } from '../fixtures/TodoV1FromTodoBuilderSourceFixtures.js';
import { generateTodoV1FromTodoBuilderSource } from './generateTodoV1FromTodoBuilderSource.js';

describe(generateTodoV1FromTodoBuilderSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoV1FromTodoBuilderSourceFixtures.any;
    });

    it('should generate a Builder from Todo to TodoV1', () => {
      expect(result).toContain("import { injectable } from 'inversify';");
      expect(result).toContain(
        "import { type Builder } from '../../../common/domain/modules/Builder.js';",
      );
      expect(result).toContain(
        "import { type Todo } from '../../domain/models/Todo.js';",
      );
      expect(result).toContain(
        "import { type TodoV1 } from '../models/TodoV1.js';",
      );
      expect(result).toContain(
        'export class TodoV1FromTodoBuilder implements Builder<Todo, TodoV1>',
      );
      expect(result).toContain('public build(input: Todo): TodoV1');
      expect(result).toContain('createdAt: input.createdAt');
      expect(result).toContain('deletedAt: input.deletedAt');
      expect(result).toContain('updatedAt: input.updatedAt');
    });
  });
});
