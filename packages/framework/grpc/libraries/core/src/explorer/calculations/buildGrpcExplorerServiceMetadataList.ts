import { type Logger } from '@inversifyjs/logger';
import { type Container } from 'inversify';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { getServiceMetadataList } from '../../service/calculations/getServiceMetadataList.js';
import { type ServiceMetadata } from '../../service/models/ServiceMetadata.js';
import { type GrpcExplorerServiceMetadata } from '../model/GrpcExplorerServiceMetadata.js';
import { buildGrpcExplorerServiceMetadata } from './buildGrpcExplorerServiceMetadata.js';

export function buildGrpcExplorerServiceMetadataList<
  TRequest = unknown,
  TResponse = unknown,
>(
  container: Container,
  logger: Logger,
): GrpcExplorerServiceMetadata<TRequest, TResponse>[] {
  const serviceMetadataList: ServiceMetadata[] | undefined =
    getServiceMetadataList();

  if (serviceMetadataList === undefined) {
    throw new InversifyGrpcAdapterError(
      InversifyGrpcAdapterErrorKind.noServiceFound,
      'No gRPC services found. Please ensure that your services are properly registered in your container and are annotated with the @Service() decorator.',
    );
  }

  const explorerServiceMetadataList: GrpcExplorerServiceMetadata<
    TRequest,
    TResponse
  >[] = [];

  for (const serviceMetadata of serviceMetadataList) {
    if (container.isBound(serviceMetadata.serviceIdentifier)) {
      explorerServiceMetadataList.push(
        buildGrpcExplorerServiceMetadata<TRequest, TResponse>(
          logger,
          serviceMetadata,
        ),
      );
    }
  }

  return explorerServiceMetadataList;
}
