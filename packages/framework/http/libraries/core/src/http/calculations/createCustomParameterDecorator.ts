import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { buildRouteParameterDecorator } from './buildRouteParameterDecorator';

export function createCustomParameterDecorator<TRequest, TResponse, TResult>(
  handler: CustomParameterDecoratorHandler<TRequest, TResponse, TResult>,
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return buildRouteParameterDecorator(
    RequestMethodParameterType.Custom,
    parameterPipeList,
    undefined,
    handler,
  );
}
