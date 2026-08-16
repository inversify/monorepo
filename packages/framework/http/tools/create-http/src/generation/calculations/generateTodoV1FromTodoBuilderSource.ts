export function generateTodoV1FromTodoBuilderSource(): string {
  return `import { injectable } from 'inversify';

import { type Builder } from '../../../common/domain/modules/Builder.js';
import { type Todo } from '../../domain/models/Todo.js';
import { type TodoV1 } from '../models/TodoV1.js';

@injectable()
export class TodoV1FromTodoBuilder implements Builder<Todo, TodoV1> {
  public build(input: Todo): TodoV1 {
    return {
      completed: input.completed,
      createdAt: input.createdAt,
      deletedAt: input.deletedAt,
      description: input.description,
      id: input.id,
      title: input.title,
      updatedAt: input.updatedAt,
    };
  }
}
`;
}
