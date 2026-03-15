/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type CustomNativeParameterDecoratorHandler } from '../../http/models/CustomNativeParameterDecoratorHandler.js';
import { type CustomParameterDecoratorHandler } from '../../http/models/CustomParameterDecoratorHandler.js';
import {
  type NonCustomRequestMethodParameterType,
  type RequestMethodParameterType,
} from '../../http/models/RequestMethodParameterType.js';

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
