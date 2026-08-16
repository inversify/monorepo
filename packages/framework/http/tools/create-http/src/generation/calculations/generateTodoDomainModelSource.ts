export function generateTodoDomainModelSource(): string {
  return `export class Todo {
  public id!: string;
  public title!: string;
  public description!: string;
  public completed!: boolean;
  public createdAt!: Date;
  public deletedAt!: Date | null;
  public updatedAt!: Date;
}
`;
}
