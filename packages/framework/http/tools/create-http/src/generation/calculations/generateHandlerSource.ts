export function generateHandlerSource(): string {
  return `export interface Handler<TInput, TOutput> {
  handle(input: TInput): TOutput;
}
`;
}
