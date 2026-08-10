export function generatePrismaTodoPersistenceAdapterSource(): string {
  return `import { inject, injectable } from 'inversify';

import { PrismaClient, type Todo as PrismaTodo } from '../../../generated/prisma/client.js';
import {
  type CreateTodoData,
  type TodoPersistencePort,
} from '../../application/ports/TodoPersistencePort.js';
import { type Todo } from '../../domain/models/Todo.js';

@injectable()
export class PrismaTodoPersistenceAdapter implements TodoPersistencePort {
  readonly #prismaClient: PrismaClient;

  constructor(@inject(PrismaClient) prismaClient: PrismaClient) {
    this.#prismaClient = prismaClient;
  }

  public async create(data: CreateTodoData): Promise<Todo> {
    const prismaTodo: PrismaTodo = await this.#prismaClient.todo.create({
      data: {
        description: data.description,
        title: data.title,
      },
    });

    return {
      completed: prismaTodo.completed,
      created_at: prismaTodo.created_at,
      deleted_at: prismaTodo.deleted_at,
      description: prismaTodo.description,
      id: prismaTodo.id,
      title: prismaTodo.title,
      updated_at: prismaTodo.updated_at,
    };
  }
}
`;
}
