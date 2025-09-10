import { ErrorFilter, Guard } from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

import { RequestMethodType } from '../../http/models/RequestMethodType';
import { HttpStatusCode } from '../../http/responses/HttpStatusCode';
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
  readonly guardList: Newable<Guard<TRequest>>[];
  readonly headerMetadataList: [string, string][];
  readonly methodKey: string | symbol;
  readonly parameterMetadataList: (
    | ControllerMethodParameterMetadata<TRequest, TResponse, TResult>
    | undefined
  )[];
  readonly path: string;
  readonly postHandlerMiddlewareList: NewableFunction[];
  readonly preHandlerMiddlewareList: NewableFunction[];
  readonly requestMethodType: RequestMethodType;
  readonly statusCode: HttpStatusCode | undefined;
  readonly useNativeHandler: boolean;
}
