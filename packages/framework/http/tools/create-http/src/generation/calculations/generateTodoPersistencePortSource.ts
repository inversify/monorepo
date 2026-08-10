export function generateTodoPersistencePortSource(): string {
  return `import { type Todo } from '../../domain/models/Todo.js';

export interface CreateTodoData {
  title: string;
  description: string;
}

export interface TodoPersistencePort {
  create(data: CreateTodoData): Promise<Todo>;
}
`;
}
