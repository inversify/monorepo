export function generateListTodosUseCaseHandlerSource(): string {
  return `import { inject, injectable } from 'inversify';

import { type Handler } from '../../../common/domain/modules/Handler.js';
import { type Todo } from '../../domain/models/Todo.js';
import { todoPersistencePortIdentifier } from '../models/todoPersistencePortIdentifier.js';
import { type TodoPersistencePort } from '../ports/TodoPersistencePort.js';

export interface ListTodosUseCaseInput {
  page: number;
  pageSize: number;
}

export interface ListTodosUseCaseResult {
  items: Todo[];
  totalItems: number;
}

@injectable()
export class ListTodosUseCaseHandler
  implements Handler<ListTodosUseCaseInput, Promise<ListTodosUseCaseResult>>
{
  readonly #todoPersistencePort: TodoPersistencePort;

  constructor(
    @inject(todoPersistencePortIdentifier)
    todoPersistencePort: TodoPersistencePort,
  ) {
    this.#todoPersistencePort = todoPersistencePort;
  }

  public async handle(
    input: ListTodosUseCaseInput,
  ): Promise<ListTodosUseCaseResult> {
    return this.#todoPersistencePort.findMany({
      deletedAt: null,
      page: input.page,
      pageSize: input.pageSize,
    });
  }
}
`;
}
