import { Container } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { RouterExplorerControllerMetadata } from '../model/RouterExplorerControllerMetadata';
import { buildRouterExplorerControllerMetadata } from './buildRouterExplorerControllerMetadata';
import { exploreControllers } from './exploreControllers';

export async function buildRouterExplorerControllerMetadataList<
  TRequest,
  TResponse,
  TResult,
>(
  container: Container,
): Promise<RouterExplorerControllerMetadata<TRequest, TResponse, TResult>[]> {
  const controllerMetadataList: ControllerMetadata[] | undefined =
    exploreControllers();

  if (controllerMetadataList === undefined) {
    throw new InversifyHttpAdapterError(
      InversifyHttpAdapterErrorKind.noControllerFound,
    );
  }

  const routerExplorerControllerMetadataList: RouterExplorerControllerMetadata[] =
    [];

  for (const controllerMetadata of controllerMetadataList) {
    if (container.isBound(controllerMetadata.target)) {
      routerExplorerControllerMetadataList.push(
        await buildRouterExplorerControllerMetadata(
          container,
          controllerMetadata,
        ),
      );
    }
  }

  return routerExplorerControllerMetadataList;
}
