export function generateTodoDomainModelSource(): string {
  return `export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  deletedAt: Date | null;
  updatedAt: Date;
}
`;
}
