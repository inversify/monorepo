/* eslint-disable @typescript-eslint/no-explicit-any */

import { RouterExplorerControllerMethodMetadata } from './RouterExplorerControllerMethodMetadata';

export interface RouterExplorerControllerMetadata<
  TRequest = any,
  TResponse = any,
  TResult = any,
> {
  readonly controllerMethodMetadataList: RouterExplorerControllerMethodMetadata<
    TRequest,
    TResponse,
    TResult
  >[];
  readonly path: string;
  readonly postHandlerMiddlewareList: NewableFunction[];
  readonly preHandlerMiddlewareList: NewableFunction[];
  readonly target: NewableFunction;
}
