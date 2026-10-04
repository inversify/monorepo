import { type Logger } from '@inversifyjs/logger';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { getRpcMetadataList } from '../../service/calculations/getRpcMetadataList.js';
import { type GrpcMethodDefinition } from '../../service/models/GrpcMethodDefinition.js';
import { type RpcMetadata } from '../../service/models/RpcMetadata.js';
import { type ServiceMetadata } from '../../service/models/ServiceMetadata.js';
import { isGrpcMethodDefinition } from '../../service/typeguard/isGrpcMethodDefinition.js';
import { type GrpcExplorerRpcMetadata } from '../model/GrpcExplorerRpcMetadata.js';
import { type GrpcExplorerServiceMetadata } from '../model/GrpcExplorerServiceMetadata.js';
import { buildGrpcExplorerRpcMetadata } from './buildGrpcExplorerRpcMetadata.js';

function buildMethodDefinitionByName(
  serviceMetadata: ServiceMetadata,
): Map<string, GrpcMethodDefinition> {
  const methodDefinitionByName: Map<string, GrpcMethodDefinition> = new Map();

  for (const name of Object.keys(serviceMetadata.definition)) {
    const methodDefinition: unknown = serviceMetadata.definition[name];

    if (!isGrpcMethodDefinition(methodDefinition)) {
      throw new InversifyGrpcAdapterError(
        InversifyGrpcAdapterErrorKind.invalidServiceDefinition,
        `Service definition method "${name}" on ${serviceMetadata.target.name} is not a valid method definition`,
      );
    }

    methodDefinitionByName.set(name, methodDefinition);
  }

  return methodDefinitionByName;
}

export function buildGrpcExplorerServiceMetadata<TRequest, TResponse>(
  logger: Logger,
  serviceMetadata: ServiceMetadata,
): GrpcExplorerServiceMetadata<TRequest, TResponse> {
  const methodDefinitionByName: Map<string, GrpcMethodDefinition> =
    buildMethodDefinitionByName(serviceMetadata);
  const rpcMetadataList: RpcMetadata[] = getRpcMetadataList(
    serviceMetadata.target,
  );
  const prototype: Record<string | symbol, unknown> = serviceMetadata.target
    .prototype as Record<string | symbol, unknown>;
  const rpcNameSet: Set<string> = new Set();
  const rpcList: GrpcExplorerRpcMetadata<TRequest, TResponse>[] = [];

  for (const rpcMetadata of rpcMetadataList) {
    const methodDefinition: GrpcMethodDefinition | undefined =
      methodDefinitionByName.get(rpcMetadata.name);

    if (methodDefinition === undefined) {
      throw new InversifyGrpcAdapterError(
        InversifyGrpcAdapterErrorKind.invalidRpc,
        `RPC "${rpcMetadata.name}" on ${serviceMetadata.target.name} is not declared by the service definition`,
      );
    }

    if (typeof prototype[rpcMetadata.methodKey] !== 'function') {
      throw new InversifyGrpcAdapterError(
        InversifyGrpcAdapterErrorKind.invalidRpc,
        `RPC "${rpcMetadata.name}" on ${serviceMetadata.target.name} is not a function`,
      );
    }

    rpcNameSet.add(rpcMetadata.name);
    rpcList.push(
      buildGrpcExplorerRpcMetadata(
        logger,
        serviceMetadata.target,
        rpcMetadata,
        methodDefinition,
      ),
    );
  }

  for (const name of methodDefinitionByName.keys()) {
    if (!rpcNameSet.has(name)) {
      throw new InversifyGrpcAdapterError(
        InversifyGrpcAdapterErrorKind.invalidRpc,
        `Service definition method "${name}" on ${serviceMetadata.target.name} has no @RPC() method`,
      );
    }
  }

  return {
    definition: serviceMetadata.definition,
    rpcList,
    serviceIdentifier: serviceMetadata.serviceIdentifier,
    target: serviceMetadata.target,
  };
}
