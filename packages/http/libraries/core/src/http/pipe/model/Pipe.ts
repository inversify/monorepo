export interface Pipe<TInput = unknown, TOutput = unknown> {
  execute(input: TInput): Promise<TOutput> | TOutput;
}
