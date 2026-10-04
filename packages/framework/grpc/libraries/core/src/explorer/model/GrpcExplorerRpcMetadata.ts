import {
  type ErrorFilter,
  type Guard,
  type Interceptor,
  type Middleware,
} from '@inversifyjs/framework-core';
import { type Newable, type ServiceIdentifier } from 'inversify';

import { type GrpcMethodDefinition } from '../../service/models/GrpcMethodDefinition.js';
import { type RpcParameterMetadata } from '../../service/models/RpcParameterMetadata.js';

export interface GrpcExplorerRpcMetadata<
  TRequest = unknown,
  TResponse = unknown,
> {
  errorDiscriminatorToErrorFilterMap: Map<
    string | symbol,
    ErrorFilter | Newable<ErrorFilter>
  >;
  errorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  >;
  guardList: ServiceIdentifier<Guard<TRequest>>[];
  interceptorList: ServiceIdentifier<Interceptor<TRequest, TResponse>>[];
  methodDefinition: GrpcMethodDefinition;
  methodKey: string | symbol;
  name: string;
  parameterMetadataList: (
    RpcParameterMetadata<TRequest, TResponse> | undefined
  )[];
  postHandlerMiddlewareList: ServiceIdentifier<Middleware>[];
  preHandlerMiddlewareList: ServiceIdentifier<Middleware>[];
  useNativeHandler: boolean;
}
