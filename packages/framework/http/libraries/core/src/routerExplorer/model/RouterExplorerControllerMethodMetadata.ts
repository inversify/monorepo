import {
  type ErrorFilter,
  type Guard,
  type Interceptor,
  type Middleware,
} from '@inversifyjs/framework-core';
import { type Newable, type ServiceIdentifier } from 'inversify';

import { type HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { type RequestMethodType } from '../../http/models/RequestMethodType.js';
import { type ControllerMethodParameterMetadata } from './ControllerMethodParameterMetadata.js';

export interface RouterExplorerControllerMethodMetadata<
  TRequest = unknown,
  TResponse = unknown,
  TResult = unknown,
> {
  readonly errorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    Newable<ErrorFilter>
  >;
  readonly guardList: ServiceIdentifier<Guard<TRequest>>[];
  readonly headerMetadataList: Record<string, string>;
  readonly interceptorList: ServiceIdentifier<
    Interceptor<TRequest, TResponse>
  >[];
  readonly methodKey: string | symbol;
  readonly parameterMetadataList: (
    | ControllerMethodParameterMetadata<TRequest, TResponse, TResult>
    | undefined
  )[];
  readonly path: string;
  readonly postHandlerMiddlewareList: ServiceIdentifier<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Middleware<TRequest, TResponse, any, TResult>
  >[];
  readonly preHandlerMiddlewareList: ServiceIdentifier<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Middleware<TRequest, TResponse, any, TResult>
  >[];
  readonly requestMethodType: RequestMethodType;
  readonly statusCode: HttpStatusCode | undefined;
  readonly useNativeHandler: boolean;
}
