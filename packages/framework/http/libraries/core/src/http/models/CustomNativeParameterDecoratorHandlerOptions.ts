import { ControllerResponse } from './ControllerResponse';
import { CustomParameterDecoratorHandlerOptions } from './CustomParameterDecoratorHandlerOptions';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CustomNativeParameterDecoratorHandlerOptions<
  TRequest = any,
  TResponse = any,
  TResult = any,
> extends CustomParameterDecoratorHandlerOptions<TRequest, TResponse> {
  send(
    request: TRequest,
    response: TResponse,
    value: ControllerResponse,
  ): TResult | Promise<TResult>;
  sendBodySeparator(
    request: TRequest,
    response: TResponse,
  ): void | Promise<void>;
}
