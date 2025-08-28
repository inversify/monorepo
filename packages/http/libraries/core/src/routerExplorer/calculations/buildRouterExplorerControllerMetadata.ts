import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  getClassGuardList,
  getClassMiddlewareList,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';

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

  const controllerGuardList: NewableFunction[] = getClassGuardList(
    controllerMetadata.target,
  );

  const controllerMiddlewareList: NewableFunction[] = getClassMiddlewareList(
    controllerMetadata.target,
  );

  const middlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(controllerMiddlewareList);

  return {
    controllerMethodMetadataList:
      buildRouterExplorerControllerMethodMetadataList(
        controllerMetadata.target,
        controllerMethodMetadataList,
      ),
    guardList: controllerGuardList,
    path: controllerMetadata.path,
    postHandlerMiddlewareList: middlewareOptions.postHandlerMiddlewareList,
    preHandlerMiddlewareList: middlewareOptions.preHandlerMiddlewareList,
    target: controllerMetadata.target,
  };
}
