import { ControllerMethodMetadata } from '../model/ControllerMethodMetadata';
import { RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata';

export function buildRouterExplorerControllerMethodMetadataList<
  TRequest,
  TResponse,
  TResult,
>(
  controller: NewableFunction,
  controllerMethodMetadataList: ControllerMethodMetadata[],
): RouterExplorerControllerMethodMetadata<TRequest, TResponse, TResult>[] {
  return controllerMethodMetadataList.map(
    (controllerMethodMetadata: ControllerMethodMetadata) =>
      buildRouterExplorerControllerMethodMetadata(
        controller,
        controllerMethodMetadata,
      ),
  );
}
