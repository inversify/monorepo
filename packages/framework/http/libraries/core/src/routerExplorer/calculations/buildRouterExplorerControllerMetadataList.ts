import { type Logger } from '@inversifyjs/logger';
import { type Container } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError.js';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind.js';
import { type ControllerMetadata } from '../model/ControllerMetadata.js';
import { type RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata.js';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata.js';
import { getControllerMetadataList } from './getControllerMetadataList.js';

export function buildRouterExplorerControllerMetadataList<
  TRequest,
  TResponse,
  TResult,
>(
  container: Container,
  logger: Logger,
): RouterExplorerControllerMetadata<TRequest, TResponse, TResult>[] {
  const controllerMetadataList: ControllerMetadata[] | undefined =
    getControllerMetadataList();

  if (controllerMetadataList === undefined) {
    throw new InversifyHttpAdapterError(
      InversifyHttpAdapterErrorKind.noControllerFound,
      'No controllers found. Please ensure that your controllers are properly registered in your container and are annotated with the @Controller() decorator.',
    );
  }

  const routerExplorerControllerMetadataList: RouterExplorerControllerMetadata<
    TRequest,
    TResponse,
    TResult
  >[] = [];

  for (const controllerMetadata of controllerMetadataList) {
    if (container.isBound(controllerMetadata.serviceIdentifier)) {
      routerExplorerControllerMetadataList.push(
        buildRouterExplorerControllerMetadata(logger, controllerMetadata),
      );
    }
  }

  return routerExplorerControllerMetadataList;
}
