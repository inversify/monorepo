export function generateTodoContainerModuleSource(): string {
  return `import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { TodoController } from '../../api/controllers/TodoController.js';

export class TodoContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(TodoController).toSelf().inSingletonScope();
    });
  }
}
`;
}
