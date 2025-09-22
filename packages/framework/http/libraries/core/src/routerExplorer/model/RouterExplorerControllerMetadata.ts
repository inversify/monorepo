/* eslint-disable @typescript-eslint/no-explicit-any */

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
  readonly serviceIdentifier: ServiceIdentifier;
  readonly target: NewableFunction;
}
