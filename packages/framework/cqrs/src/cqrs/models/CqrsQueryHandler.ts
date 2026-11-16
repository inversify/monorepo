export interface CqrsQueryHandler<
  TQuery extends object = object,
  TResult = unknown,
> {
  handle(query: TQuery): Promise<TResult> | TResult;
}
