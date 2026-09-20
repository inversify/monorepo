export function generateGetTodoUseCaseHandlerSource(): string {
  return `import { inject, injectable } from 'inversify';

import { type Handler } from '../../../common/domain/modules/Handler.js';
import { type Todo } from '../../domain/models/Todo.js';
import { todoPersistencePortIdentifier } from '../models/todoPersistencePortIdentifier.js';
import { type TodoPersistencePort } from '../ports/TodoPersistencePort.js';

export interface GetTodoUseCaseInput {
  id: string;
}

@injectable()
export class GetTodoUseCaseHandler
  implements Handler<GetTodoUseCaseInput, Promise<Todo | undefined>>
{
  readonly #todoPersistencePort: TodoPersistencePort;

  constructor(
    @inject(todoPersistencePortIdentifier)
    todoPersistencePort: TodoPersistencePort,
  ) {
    this.#todoPersistencePort = todoPersistencePort;
  }

  public async handle(
    input: GetTodoUseCaseInput,
  ): Promise<Todo | undefined> {
    return this.#todoPersistencePort.findOne({
      deletedAt: null,
      id: input.id,
    });
  }
}
`;
}
