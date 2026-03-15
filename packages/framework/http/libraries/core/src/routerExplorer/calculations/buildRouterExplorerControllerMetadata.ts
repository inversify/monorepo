import { type Logger } from '@inversifyjs/logger';

import { type ControllerMetadata } from '../model/ControllerMetadata.js';
import { type ControllerMethodMetadata } from '../model/ControllerMethodMetadata.js';
import { type RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata.js';
import { buildRouterExplorerControllerMethodMetadataList } from './buildRouterExplorerControllerMethodMetadataList.js';
import { getControllerMethodMetadataList } from './getControllerMethodMetadataList.js';

export function buildRouterExplorerControllerMetadata<
  TRequest,
  TResponse,
  TResult,
>(
  logger: Logger,
  controllerMetadata: ControllerMetadata,
): RouterExplorerControllerMetadata<TRequest, TResponse, TResult> {
  const controllerMethodMetadataList: ControllerMethodMetadata[] =
    getControllerMethodMetadataList(controllerMetadata.target);

  return {
    controllerMethodMetadataList:
      buildRouterExplorerControllerMethodMetadataList(
        logger,
        controllerMetadata,
        controllerMethodMetadataList,
      ),
    path: controllerMetadata.path,
    serviceIdentifier: controllerMetadata.serviceIdentifier,
    target: controllerMetadata.target,
  };
}
