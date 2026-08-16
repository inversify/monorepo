import { type CustomParameterDecoratorHandlerOptions } from '@inversifyjs/http-core';

export type RequestTransformer<TRequest, TResponse> = (
  request: TRequest,
  response: TResponse,
  options: CustomParameterDecoratorHandlerOptions<TRequest, TResponse>,
) => TRequest | Promise<TRequest>;
