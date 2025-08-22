import { StatusCode } from '@inversifyjs/framework-core';

import { RequestMethodType } from '../../http/models/RequestMethodType';
import { ControllerMethodParameterMetadata } from './ControllerMethodParameterMetadata';

export interface RouterExplorerControllerMethodMetadata<
  TRequest = unknown,
  TResponse = unknown,
  TResult = unknown,
> {
  guardList: NewableFunction[];
  headerMetadataList: [string, string][];
  methodKey: string | symbol;
  parameterMetadataList: (
    | ControllerMethodParameterMetadata<TRequest, TResponse, TResult>
    | undefined
  )[];
  path: string;
  postHandlerMiddlewareList: NewableFunction[];
  preHandlerMiddlewareList: NewableFunction[];
  requestMethodType: RequestMethodType;
  statusCode: StatusCode | undefined;
  useNativeHandler: boolean;
}
