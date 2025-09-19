import {
  ApplyMiddlewareOptions,
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  getClassMiddlewareList,
  Middleware,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';
import { getControllerMethodMetadataList } from './getControllerMethodMetadataList';

export function buildRouterExplorerControllerMetadata<
  TRequest,
  TResponse,
  TResult,
>(
  controllerMetadata: ControllerMetadata,
): RouterExplorerControllerMetadata<TRequest, TResponse, TResult> {
  const controllerMethodMetadataList: ControllerMethodMetadata[] =
    getControllerMethodMetadataList(controllerMetadata.target);

  const controllerMiddlewareList: (
    | // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ServiceIdentifier<Middleware<TRequest, TResponse, any, TResult>>
    | ApplyMiddlewareOptions
  )[] = getClassMiddlewareList(controllerMetadata.target);

  const middlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(controllerMiddlewareList);

  return {
    controllerMethodMetadataList:
      buildRouterExplorerControllerMethodMetadataList(
        controllerMetadata,
        controllerMethodMetadataList,
      ),
    path: controllerMetadata.path,
    postHandlerMiddlewareList: middlewareOptions.postHandlerMiddlewareList,
    preHandlerMiddlewareList: middlewareOptions.preHandlerMiddlewareList,
    serviceIdentifier: controllerMetadata.serviceIdentifier,
    target: controllerMetadata.target,
  };
}
