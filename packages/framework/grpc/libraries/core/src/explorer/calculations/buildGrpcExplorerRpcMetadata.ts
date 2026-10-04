import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  getClassGuardList,
  getClassInterceptorList,
  getClassMethodGuardList,
  getClassMethodInterceptorList,
  getClassMethodMiddlewareList,
  getClassMiddlewareList,
  type Guard,
  type Interceptor,
  type MiddlewareOptions,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type ServiceIdentifier } from 'inversify';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { getRpcParameterMetadataList } from '../../service/calculations/getRpcParameterMetadataList.js';
import { type GrpcMethodDefinition } from '../../service/models/GrpcMethodDefinition.js';
import { type RpcMetadata } from '../../service/models/RpcMetadata.js';
import { type RpcParameterMetadata } from '../../service/models/RpcParameterMetadata.js';
import { RpcParameterType } from '../../service/models/RpcParameterType.js';
import { type GrpcExplorerRpcMetadata } from '../model/GrpcExplorerRpcMetadata.js';
import {
  buildErrorFilterMaps,
  type ErrorFilterMaps,
} from './buildErrorFilterMaps.js';

export function buildGrpcExplorerRpcMetadata<TRequest, TResponse>(
  logger: Logger,
  target: NewableFunction,
  rpcMetadata: RpcMetadata,
  methodDefinition: GrpcMethodDefinition,
): GrpcExplorerRpcMetadata<TRequest, TResponse> {
  const parameterMetadataList: (RpcParameterMetadata | undefined)[] =
    getRpcParameterMetadataList(target, rpcMetadata.methodKey);
  const usesCallback: boolean = parameterMetadataList.some(
    (parameterMetadata: RpcParameterMetadata | undefined): boolean =>
      parameterMetadata?.parameterType === RpcParameterType.Callback,
  );

  if (methodDefinition.responseStream && usesCallback) {
    throw new InversifyGrpcAdapterError(
      InversifyGrpcAdapterErrorKind.invalidRpc,
      `RPC "${rpcMetadata.name}" on ${target.name} uses @Callback(), but response-streaming RPCs have no callback`,
    );
  }

  const classMiddlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(
      getClassMiddlewareList(target),
    );
  const methodMiddlewareOptions: MiddlewareOptions =
    buildMiddlewareOptionsFromApplyMiddlewareOptions(
      getClassMethodMiddlewareList(target, rpcMetadata.methodKey),
    );
  const errorFilterMaps: ErrorFilterMaps = buildErrorFilterMaps(
    logger,
    target,
    rpcMetadata.methodKey,
  );
  const guardList: ServiceIdentifier<Guard<TRequest>>[] = [
    ...getClassGuardList<TRequest>(target),
    ...getClassMethodGuardList<TRequest>(target, rpcMetadata.methodKey),
  ];
  const interceptorList: ServiceIdentifier<Interceptor<TRequest, TResponse>>[] =
    [
      ...getClassInterceptorList(target),
      ...getClassMethodInterceptorList(target, rpcMetadata.methodKey),
    ];

  return {
    errorDiscriminatorToErrorFilterMap:
      errorFilterMaps.errorDiscriminatorToErrorFilterMap,
    errorTypeToErrorFilterMap: errorFilterMaps.errorTypeToErrorFilterMap,
    guardList,
    interceptorList,
    methodDefinition,
    methodKey: rpcMetadata.methodKey,
    name: rpcMetadata.name,
    parameterMetadataList,
    postHandlerMiddlewareList: [
      ...classMiddlewareOptions.postHandlerMiddlewareList,
      ...methodMiddlewareOptions.postHandlerMiddlewareList,
    ],
    preHandlerMiddlewareList: [
      ...classMiddlewareOptions.preHandlerMiddlewareList,
      ...methodMiddlewareOptions.preHandlerMiddlewareList,
    ],
    useNativeHandler: methodDefinition.responseStream || usesCallback,
  };
}
