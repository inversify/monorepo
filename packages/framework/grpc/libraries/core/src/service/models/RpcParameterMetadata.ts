/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type CustomParameterDecoratorHandler } from './CustomParameterDecoratorHandler.js';
import { type RpcParameterType } from './RpcParameterType.js';

interface BaseRpcParameterMetadata<TParameterType extends RpcParameterType> {
  parameterType: TParameterType;
  pipeList: (ServiceIdentifier<Pipe> | Pipe)[];
}

interface CustomRpcParameterMetadata<
  TCall = any,
  TResponse = any,
  TResult = any,
> extends BaseRpcParameterMetadata<RpcParameterType.Custom> {
  customParameterDecoratorHandler: CustomParameterDecoratorHandler<
    TCall,
    TResponse,
    TResult
  >;
}

export type RpcParameterMetadata<TCall = any, TResponse = any, TResult = any> =
  | BaseRpcParameterMetadata<RpcParameterType.Call | RpcParameterType.Callback>
  | CustomRpcParameterMetadata<TCall, TResponse, TResult>;
