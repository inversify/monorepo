import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler.js';
import { RpcParameterType } from '../models/RpcParameterType.js';
import { rpcParameter } from './rpcParameter.js';

export function createCustomParameterDecorator<TCall, TResponse, TResult>(
  handler: CustomParameterDecoratorHandler<TCall, TResponse, TResult>,
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return rpcParameter({
    customParameterDecoratorHandler: handler,
    parameterType: RpcParameterType.Custom,
    pipeList: parameterPipeList,
  });
}
