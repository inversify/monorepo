export interface GrpcHandlerListResult<TResult> {
  completed: boolean;
  result: TResult | undefined;
}
