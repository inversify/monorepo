import { CustomParameterDecoratorHandlerOptions } from './CustomParameterDecoratorHandlerOptions';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type CustomParameterDecoratorHandler<
  TRequest = any,
  TResponse = any,
  TResult = any,
> = (
  request: TRequest,
  response: TResponse,
  options: CustomParameterDecoratorHandlerOptions<TRequest, TResponse>,
) => Promise<TResult> | TResult;
