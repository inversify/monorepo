export function generateStatusDomainModelSource(): string {
  return `export class Status {
  public status!: string;
}
`;
}
