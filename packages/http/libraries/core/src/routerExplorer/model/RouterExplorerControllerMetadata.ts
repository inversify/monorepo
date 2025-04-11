/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouterExplorerControllerMethodMetadata } from './RouterExplorerControllerMethodMetadata';

export interface RouterExplorerControllerMetadata<
  TRequest = any,
  TResponse = any,
  TResult = any,
> {
  controllerMethodMetadataList: RouterExplorerControllerMethodMetadata<
    TRequest,
    TResponse,
    TResult
  >[];
  guardList: NewableFunction[];
  path: string;
  postHandlerMiddlewareList: NewableFunction[];
  preHandlerMiddlewareList: NewableFunction[];
  target: NewableFunction;
}
