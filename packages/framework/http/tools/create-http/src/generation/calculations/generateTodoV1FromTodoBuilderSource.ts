import { ApiStyle } from '../../models/ApiStyle.js';

export function generateTodoV1FromTodoBuilderSource(
  apiStyle: ApiStyle,
): string {
  const todoV1Import: string =
    apiStyle === ApiStyle.schemaFirst
      ? "import { type TodoV1 } from '../../../generated/api/index.js';"
      : "import { type TodoV1 } from '../models/TodoV1.js';";

  const dateAssignments: string =
    apiStyle === ApiStyle.schemaFirst
      ? `      createdAt: input.createdAt.toISOString(),
      deletedAt:
        input.deletedAt === null ? null : input.deletedAt.toISOString(),
      description: input.description,
      id: input.id,
      title: input.title,
      updatedAt: input.updatedAt.toISOString(),`
      : `      createdAt: input.createdAt,
      deletedAt: input.deletedAt,
      description: input.description,
      id: input.id,
      title: input.title,
      updatedAt: input.updatedAt,`;

  return `import { injectable } from 'inversify';

import { type Builder } from '../../../common/domain/modules/Builder.js';
import { type Todo } from '../../domain/models/Todo.js';
${todoV1Import}

@injectable()
export class TodoV1FromTodoBuilder implements Builder<Todo, TodoV1> {
  public build(input: Todo): TodoV1 {
    return {
      completed: input.completed,
${dateAssignments}
    };
  }
}
`;
}
