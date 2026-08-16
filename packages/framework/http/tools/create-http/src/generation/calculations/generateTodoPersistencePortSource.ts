export function generateTodoPersistencePortSource(): string {
  return `import { type Todo } from '../../domain/models/Todo.js';

export interface CreateTodoData {
  title: string;
  description: string;
}

export interface FindTodosQuery {
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
  delete(id: string): Promise<Todo | undefined>;
  findById(id: string): Promise<Todo | undefined>;
  findMany(query: FindTodosQuery): Promise<FindTodosResult>;
  update(id: string, data: UpdateTodoData): Promise<Todo | undefined>;
}
`;
}
