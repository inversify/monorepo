import { Logger } from '@inversifyjs/logger';
import { Container } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata';
import { getControllerMetadataList } from './getControllerMetadataList';

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
