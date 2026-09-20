import { beforeAll, describe, expect, it } from 'vitest';

import { generateTodoContainerModuleSource } from './generateTodoContainerModuleSource.js';

describe(generateTodoContainerModuleSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateTodoContainerModuleSource();
    });

    it('should generate a TodoContainerModule that binds handlers, the controller, and TodoV1 mapper', () => {
      expect(result).toContain(
        "import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';",
      );
      expect(result).toContain(
        "import { CreateTodoUseCaseHandler } from '../../../application/handlers/CreateTodoUseCaseHandler.js';",
      );
      expect(result).toContain(
        "import { GetTodoUseCaseHandler } from '../../../application/handlers/GetTodoUseCaseHandler.js';",
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
        'options.bind(CreateTodoUseCaseHandler).toSelf().inSingletonScope();',
      );
      expect(result).toContain(
        'options.bind(DeleteTodoUseCaseHandler).toSelf().inSingletonScope();',
      );
      expect(result).toContain(
        'options.bind(GetTodoUseCaseHandler).toSelf().inSingletonScope();',
      );
      expect(result).toContain(
        'options.bind(ListTodosUseCaseHandler).toSelf().inSingletonScope();',
      );
      expect(result).toContain(
        'options.bind(UpdateTodoUseCaseHandler).toSelf().inSingletonScope();',
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
