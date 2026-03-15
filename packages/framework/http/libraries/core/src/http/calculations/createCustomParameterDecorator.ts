import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler.js';
import { buildCustomControllerMethodParameterMetadata } from './buildCustomControllerMethodParameterMetadata.js';
import { requestParam } from './requestParam.js';

export function createCustomParameterDecorator<TRequest, TResponse, TResult>(
  handler: CustomParameterDecoratorHandler<TRequest, TResponse, TResult>,
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return requestParam(
    buildCustomControllerMethodParameterMetadata(parameterPipeList, handler),
  );
}
