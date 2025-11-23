import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { buildCustomControllerMethodParameterMetadata } from './buildCustomControllerMethodParameterMetadata';
import { requestParam } from './requestParam';

export function createCustomParameterDecorator<TRequest, TResponse, TResult>(
  handler: CustomParameterDecoratorHandler<TRequest, TResponse, TResult>,
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return requestParam(
    buildCustomControllerMethodParameterMetadata(parameterPipeList, handler),
  );
}
