import { CustomNativeParameterDecoratorHandlerOptions } from './CustomNativeParameterDecoratorHandlerOptions';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type CustomNativeParameterDecoratorHandler<
  TRequest = any,
  TResponse = any,
  TDecoratorResult = any,
  TResult = any,
> = (
  request: TRequest,
  response: TResponse,
  options: CustomNativeParameterDecoratorHandlerOptions<
    TRequest,
    TResponse,
    TResult
  >,
) => Promise<TDecoratorResult> | TDecoratorResult;
