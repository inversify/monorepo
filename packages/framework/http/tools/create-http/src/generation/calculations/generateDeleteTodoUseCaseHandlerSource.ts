export function generateDeleteTodoUseCaseHandlerSource(): string {
  return `import { inject, injectable } from 'inversify';

import { type Handler } from '../../../common/domain/modules/Handler.js';
import { type Todo } from '../../domain/models/Todo.js';
import { todoPersistencePortIdentifier } from '../models/todoPersistencePortIdentifier.js';
import { type TodoPersistencePort } from '../ports/TodoPersistencePort.js';

export interface DeleteTodoUseCaseInput {
  id: string;
}

@injectable()
export class DeleteTodoUseCaseHandler
  implements Handler<DeleteTodoUseCaseInput, Promise<Todo | undefined>>
{
  readonly #todoPersistencePort: TodoPersistencePort;

  constructor(
    @inject(todoPersistencePortIdentifier)
    todoPersistencePort: TodoPersistencePort,
  ) {
    this.#todoPersistencePort = todoPersistencePort;
  }

  public async handle(
    input: DeleteTodoUseCaseInput,
  ): Promise<Todo | undefined> {
    return this.#todoPersistencePort.delete({
      deletedAt: null,
      id: input.id,
    });
  }
}
`;
}
