export interface Builder<TInput, TOutput> {
  build(input: TInput): TOutput;
}
