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

  return {
    controllerMethodMetadataList:
      buildRouterExplorerControllerMethodMetadataList(
        controllerMetadata,
        controllerMethodMetadataList,
      ),
    path: controllerMetadata.path,
    serviceIdentifier: controllerMetadata.serviceIdentifier,
    target: controllerMetadata.target,
  };
}
