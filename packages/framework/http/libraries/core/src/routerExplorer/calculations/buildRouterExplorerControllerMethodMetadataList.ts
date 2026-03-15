import { type Logger } from '@inversifyjs/logger';

import { type ControllerMetadata } from '../model/ControllerMetadata.js';
import { type ControllerMethodMetadata } from '../model/ControllerMethodMetadata.js';
import { type RouterExplorerControllerMethodMetadata } from '../model/RouterExplorerControllerMethodMetadata.js';
import { buildRouterExplorerControllerMethodMetadata } from './buildRouterExplorerControllerMethodMetadata.js';

export function buildRouterExplorerControllerMethodMetadataList<
  TRequest,
  TResponse,
  TResult,
>(
  logger: Logger,
  controllerMetadata: ControllerMetadata,
  controllerMethodMetadataList: ControllerMethodMetadata[],
): RouterExplorerControllerMethodMetadata<TRequest, TResponse, TResult>[] {
  return controllerMethodMetadataList.map(
    (controllerMethodMetadata: ControllerMethodMetadata) =>
      buildRouterExplorerControllerMethodMetadata(
        logger,
        controllerMetadata,
        controllerMethodMetadata,
      ),
  );
}
