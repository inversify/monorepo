export function generateTodoFromPrismaTodoBuilderSource(): string {
  return `import { injectable } from 'inversify';

import { type Builder } from '../../../../common/domain/modules/Builder.js';
import { type Todo as PrismaTodo } from '../../../../generated/prisma/client.js';
import { type Todo } from '../../../domain/models/Todo.js';

@injectable()
export class TodoFromPrismaTodoBuilder implements Builder<PrismaTodo, Todo> {
  public build(input: PrismaTodo): Todo {
    return {
      completed: input.completed,
      createdAt: input.created_at,
      deletedAt: input.deleted_at,
      description: input.description,
      id: input.id,
      title: input.title,
      updatedAt: input.updated_at,
    };
  }
}
`;
}
