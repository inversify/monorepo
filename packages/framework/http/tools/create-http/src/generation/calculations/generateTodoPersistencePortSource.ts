export function generateTodoPersistencePortSource(): string {
  return `import { type Todo } from '../../domain/models/Todo.js';

export interface CreateTodoData {
  title: string;
  description: string;
}

export interface FindTodoQuery {
  deletedAt?: Date | null;
  id?: string;
}

export interface FindTodosQuery extends FindTodoQuery {
  page: number;
  pageSize: number;
}

export interface FindTodosResult {
  items: Todo[];
  totalItems: number;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TodoPersistencePort {
  create(data: CreateTodoData): Promise<Todo>;
  delete(query: FindTodoQuery): Promise<Todo | undefined>;
  findOne(query: FindTodoQuery): Promise<Todo | undefined>;
  findMany(query: FindTodosQuery): Promise<FindTodosResult>;
  update(query: FindTodoQuery, data: UpdateTodoData): Promise<Todo | undefined>;
}
`;
}
