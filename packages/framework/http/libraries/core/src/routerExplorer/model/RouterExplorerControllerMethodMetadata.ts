import {
  ErrorFilter,
  Guard,
  Interceptor,
  Middleware,
} from '@inversifyjs/framework-core';
import { Newable, ServiceIdentifier } from 'inversify';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { RequestMethodType } from '../../http/models/RequestMethodType';
import { ControllerMethodParameterMetadata } from './ControllerMethodParameterMetadata';

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
