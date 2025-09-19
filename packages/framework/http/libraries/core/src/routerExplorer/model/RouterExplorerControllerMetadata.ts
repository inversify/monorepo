/* eslint-disable @typescript-eslint/no-explicit-any */

import { Middleware } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

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
  readonly postHandlerMiddlewareList: ServiceIdentifier<
    Middleware<TRequest, TResponse, any, TResult>
  >[];
  readonly preHandlerMiddlewareList: ServiceIdentifier<
    Middleware<TRequest, TResponse, any, TResult>
  >[];
  readonly target: NewableFunction;
}
