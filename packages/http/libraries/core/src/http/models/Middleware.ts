export interface Middleware<
  TRequest = unknown,
  TResponse = unknown,
  TNextFunction = unknown,
> {
  execute(
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<void>;
}
