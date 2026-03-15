/* eslint-disable @typescript-eslint/no-explicit-any */

import { type ServiceIdentifier } from 'inversify';

import { type RouterExplorerControllerMethodMetadata } from './RouterExplorerControllerMethodMetadata.js';

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
  readonly serviceIdentifier: ServiceIdentifier;
  readonly target: NewableFunction;
}
