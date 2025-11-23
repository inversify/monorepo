import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler';
import { buildCustomNativeControllerMethodParameterMetadata } from './buildCustomNativeControllerMethodParameterMetadata';
import { requestParam } from './requestParam';

export function createCustomNativeParameterDecorator<
  TRequest,
  TResponse,
  TResult,
>(
  handler: CustomNativeParameterDecoratorHandler<TRequest, TResponse, TResult>,
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return requestParam(
    buildCustomNativeControllerMethodParameterMetadata(
      parameterPipeList,
      handler,
    ),
  );
}
