export function generateCreateTodoUseCaseHandlerSource(): string {
  return `import { inject, injectable } from 'inversify';

import { type Handler } from '../../../common/domain/modules/Handler.js';
import { type Todo } from '../../domain/models/Todo.js';
import { todoPersistencePortIdentifier } from '../models/todoPersistencePortIdentifier.js';
import {
  type CreateTodoData,
  type TodoPersistencePort,
} from '../ports/TodoPersistencePort.js';

export interface CreateTodoUseCaseInput {
  description: string;
  title: string;
}

@injectable()
export class CreateTodoUseCaseHandler
  implements Handler<CreateTodoUseCaseInput, Promise<Todo>>
{
  readonly #todoPersistencePort: TodoPersistencePort;

  constructor(
    @inject(todoPersistencePortIdentifier)
    todoPersistencePort: TodoPersistencePort,
  ) {
    this.#todoPersistencePort = todoPersistencePort;
  }

  public async handle(input: CreateTodoUseCaseInput): Promise<Todo> {
    const createTodoData: CreateTodoData = {
      description: input.description,
      title: input.title,
    };

    return this.#todoPersistencePort.create(createTodoData);
  }
}
`;
}
