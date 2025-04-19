import { Newable } from 'inversify';

import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Pipe } from '../pipe/model/Pipe';
import { buildRequestParameterDecorator } from './buildRequestParameterDecorator';

export function createCustomParameterDecorator<TRequest, TResponse, TResult>(
  handler: CustomParameterDecoratorHandler<TRequest, TResponse, TResult>,
  ...parameterPipeList: (Newable<Pipe> | Pipe)[]
): ParameterDecorator {
  return buildRequestParameterDecorator(
    RequestMethodParameterType.CUSTOM,
    parameterPipeList,
    undefined,
    handler,
  );
}
