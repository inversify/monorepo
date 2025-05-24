import { ControllerMetadata } from '../model/ControllerMetadata';
import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { MiddlewareOptions } from '../model/MiddlewareOptions';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { buildMiddlewareOptionsFromApplyMiddlewareOptions } from './buildMiddlewareOptionsFromApplyMiddlewareOptions';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList';
import { exploreControllerGuardList } from './exploreControllerGuardList';
import { exploreControllerMethodMetadataList } from './exploreControllerMethodMetadataList';
import { exploreControllerMiddlewareList } from './exploreControllerMiddlewareList';

export function buildRouterExplorerControllerMetadata<
  TRequest,
  TResponse,
  TResult,
>(
  controllerMetadata: ControllerMetadata,
): RouterExplorerControllerMetadata<TRequest, TResponse, TResult> {
  const controllerMethodMetadataList: ControllerMethodMetadata[] =
    exploreControllerMethodMetadataList(controllerMetadata.target);

  const controllerGuardList: NewableFunction[] = exploreControllerGuardList(
    controllerMetadata.target,
  );

  const controllerMiddlewareList: NewableFunction[] =
    exploreControllerMiddlewareList(controllerMetadata.target);

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
