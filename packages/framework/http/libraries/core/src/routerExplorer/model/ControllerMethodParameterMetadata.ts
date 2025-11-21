/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { CustomParameterDecoratorHandler } from '../../http/models/CustomParameterDecoratorHandler';
import {
  CustomRequestMethodParameterType,
  NonCustomRequestMethodParameterType,
  RequestMethodParameterType,
} from '../../http/models/RequestMethodParameterType';

export interface BaseControllerMethodParameterMetadata<
  TParamType extends RequestMethodParameterType,
> {
  parameterType: TParamType;
  parameterName?: string | undefined;
  pipeList: (ServiceIdentifier<Pipe> | Pipe)[];
}

export interface ControllerMethodCustomParameterMetadata<
  TRequest = any,
  TResponse = any,
  TResult = any,
> extends BaseControllerMethodParameterMetadata<CustomRequestMethodParameterType> {
  customParameterDecoratorHandler: CustomParameterDecoratorHandler<
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
  | ControllerMethodCustomParameterMetadata<TRequest, TResponse, TResult>;
