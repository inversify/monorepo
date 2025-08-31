import { RequestMethodType } from '../../http/models/RequestMethodType';
import { HttpStatusCode } from '../../http/responses/HttpStatusCode';
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
  statusCode: HttpStatusCode | undefined;
  useNativeHandler: boolean;
}
