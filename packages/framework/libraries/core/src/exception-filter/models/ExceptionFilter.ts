/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ExceptionFilter<TRequest = any, TResponse = any> {
  catch(
    exception: unknown,
    request: TRequest,
    response: TResponse,
  ): void | Promise<void>;
}
