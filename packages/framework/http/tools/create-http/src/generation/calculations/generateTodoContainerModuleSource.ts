export function generateTodoContainerModuleSource(): string {
  return `import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { CreateTodoUseCaseHandler } from '../../../application/handlers/CreateTodoUseCaseHandler.js';
import { DeleteTodoUseCaseHandler } from '../../../application/handlers/DeleteTodoUseCaseHandler.js';
import { GetTodoUseCaseHandler } from '../../../application/handlers/GetTodoUseCaseHandler.js';
import { ListTodosUseCaseHandler } from '../../../application/handlers/ListTodosUseCaseHandler.js';
import { UpdateTodoUseCaseHandler } from '../../../application/handlers/UpdateTodoUseCaseHandler.js';
import { TodoV1FromTodoBuilder } from '../../../api/builders/TodoV1FromTodoBuilder.js';
import { TodoController } from '../../../api/controllers/TodoController.js';

export class TodoContainerModule extends ContainerModule {
  constructor() {
    super((options: ContainerModuleLoadOptions) => {
      options.bind(CreateTodoUseCaseHandler).toSelf().inSingletonScope();
      options.bind(DeleteTodoUseCaseHandler).toSelf().inSingletonScope();
      options.bind(GetTodoUseCaseHandler).toSelf().inSingletonScope();
      options.bind(ListTodosUseCaseHandler).toSelf().inSingletonScope();
      options.bind(TodoController).toSelf().inSingletonScope();
      options.bind(TodoV1FromTodoBuilder).toSelf().inSingletonScope();
      options.bind(UpdateTodoUseCaseHandler).toSelf().inSingletonScope();
    });
  }
}
`;
}
