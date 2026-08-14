export function generateBuilderSource(): string {
  return `export interface Builder<TInput, TOutput> {
  build(input: TInput): TOutput;
}
`;
}
