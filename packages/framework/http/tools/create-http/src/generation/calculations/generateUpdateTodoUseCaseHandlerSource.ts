export function generateUpdateTodoUseCaseHandlerSource(): string {
  return `import { inject, injectable } from 'inversify';

import { type Handler } from '../../../common/domain/modules/Handler.js';
import { type Todo } from '../../domain/models/Todo.js';
import { todoPersistencePortIdentifier } from '../models/todoPersistencePortIdentifier.js';
import {
  type TodoPersistencePort,
  type UpdateTodoData,
} from '../ports/TodoPersistencePort.js';

export interface UpdateTodoUseCaseInput {
  completed?: boolean;
  description?: string;
  id: string;
  title?: string;
}

@injectable()
export class UpdateTodoUseCaseHandler
  implements Handler<UpdateTodoUseCaseInput, Promise<Todo | undefined>>
{
  readonly #todoPersistencePort: TodoPersistencePort;

  constructor(
    @inject(todoPersistencePortIdentifier)
    todoPersistencePort: TodoPersistencePort,
  ) {
    this.#todoPersistencePort = todoPersistencePort;
  }

  public async handle(
    input: UpdateTodoUseCaseInput,
  ): Promise<Todo | undefined> {
    const updateTodoData: UpdateTodoData = {};

    if (('title' satisfies keyof UpdateTodoUseCaseInput) in input) {
      updateTodoData.title = input.title;
    }

    if (('description' satisfies keyof UpdateTodoUseCaseInput) in input) {
      updateTodoData.description = input.description;
    }

    if (('completed' satisfies keyof UpdateTodoUseCaseInput) in input) {
      updateTodoData.completed = input.completed;
    }

    return this.#todoPersistencePort.update(
      {
        deletedAt: null,
        id: input.id,
      },
      updateTodoData,
    );
  }
}
`;
}
