import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  exploreClassGuardList,
  exploreClassMiddlewareList,
  MiddlewareOptions,
} from '@inversifyjs/framework-core';

import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';
import { exploreControllerMethodMetadataList } from './exploreControllerMethodMetadataList';

export function buildRouterExplorerControllerMetadata<
  TRequest,
  TResponse,
  TResult,
>(
  controllerMetadata: ControllerMetadata,
): RouterExplorerControllerMetadata<TRequest, TResponse, TResult> {
  const controllerMethodMetadataList: ControllerMethodMetadata[] =
    exploreControllerMethodMetadataList(controllerMetadata.target);

  const controllerGuardList: NewableFunction[] = exploreClassGuardList(
    controllerMetadata.target,
  );

  const controllerMiddlewareList: NewableFunction[] =
    exploreClassMiddlewareList(controllerMetadata.target);

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
