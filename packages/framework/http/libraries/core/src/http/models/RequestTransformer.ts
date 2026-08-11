import { type CustomParameterDecoratorHandlerOptions } from './CustomParameterDecoratorHandlerOptions.js';

export type RequestTransformer<TRequest, TResponse> = (
  request: TRequest,
  response: TResponse,
  options: CustomParameterDecoratorHandlerOptions<TRequest, TResponse>,
) => TRequest | Promise<TRequest>;
