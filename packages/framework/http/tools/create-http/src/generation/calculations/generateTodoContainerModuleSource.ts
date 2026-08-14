export function generateTodoContainerModuleSource(): string {
  return `import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { TodoV1FromTodoBuilder } from '../../../api/builders/TodoV1FromTodoBuilder.js';
import { TodoController } from '../../../api/controllers/TodoController.js';

export class TodoContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(TodoController).toSelf().inSingletonScope();
      options.bind(TodoV1FromTodoBuilder).toSelf().inSingletonScope();
    });
  }
}
`;
}
