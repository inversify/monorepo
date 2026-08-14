import { beforeAll, describe, expect, it } from 'vitest';

import { generateTodoContainerModuleSource } from './generateTodoContainerModuleSource.js';

describe(generateTodoContainerModuleSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateTodoContainerModuleSource();
    });

    it('should generate a TodoContainerModule that binds the controller and TodoV1 mapper', () => {
      expect(result).toContain(
        "import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';",
      );
      expect(result).toContain(
        "import { TodoV1FromTodoBuilder } from '../../../api/builders/TodoV1FromTodoBuilder.js';",
      );
      expect(result).toContain(
        "import { TodoController } from '../../../api/controllers/TodoController.js';",
      );
      expect(result).toContain(
        'export class TodoContainerModule extends ContainerModule',
      );
      expect(result).toContain(
        'options.bind(TodoController).toSelf().inSingletonScope();',
      );
      expect(result).toContain(
        'options.bind(TodoV1FromTodoBuilder).toSelf().inSingletonScope();',
      );
    });
  });
});
