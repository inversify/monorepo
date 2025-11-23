/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { CustomNativeParameterDecoratorHandler } from '../../http/models/CustomNativeParameterDecoratorHandler';
import { CustomParameterDecoratorHandler } from '../../http/models/CustomParameterDecoratorHandler';
import {
  NonCustomRequestMethodParameterType,
  RequestMethodParameterType,
} from '../../http/models/RequestMethodParameterType';

interface BaseControllerMethodParameterMetadata<
  TParamType extends RequestMethodParameterType,
> {
  parameterType: TParamType;
  parameterName?: string | undefined;
  pipeList: (ServiceIdentifier<Pipe> | Pipe)[];
}

interface ControllerMethodCustomParameterMetadata<
  TRequest = any,
  TResponse = any,
  TResult = any,
> extends BaseControllerMethodParameterMetadata<RequestMethodParameterType.Custom> {
  customParameterDecoratorHandler: CustomParameterDecoratorHandler<
    TRequest,
    TResponse,
    TResult
  >;
}

interface ControllerMethodCustomNativeParameterMetadata<
  TRequest = any,
  TResponse = any,
  TResult = any,
> extends BaseControllerMethodParameterMetadata<RequestMethodParameterType.CustomNative> {
  customParameterDecoratorHandler: CustomNativeParameterDecoratorHandler<
    TRequest,
    TResponse,
    TResult
  >;
}

export type ControllerMethodParameterMetadata<
  TRequest = any,
  TResponse = any,
  TResult = any,
> =
  | BaseControllerMethodParameterMetadata<NonCustomRequestMethodParameterType>
  | ControllerMethodCustomNativeParameterMetadata<TRequest, TResponse, TResult>
  | ControllerMethodCustomParameterMetadata<TRequest, TResponse, TResult>;
