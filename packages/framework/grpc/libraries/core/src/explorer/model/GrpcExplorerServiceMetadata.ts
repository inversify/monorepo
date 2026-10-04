import { type ServiceIdentifier } from 'inversify';

import { type GrpcServiceDefinition } from '../../service/models/GrpcServiceDefinition.js';
import { type GrpcExplorerRpcMetadata } from './GrpcExplorerRpcMetadata.js';

export interface GrpcExplorerServiceMetadata<
  TRequest = unknown,
  TResponse = unknown,
> {
  definition: GrpcServiceDefinition;
  rpcList: GrpcExplorerRpcMetadata<TRequest, TResponse>[];
  serviceIdentifier: ServiceIdentifier;
  target: NewableFunction;
}
