import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler.js';
import { buildCustomNativeControllerMethodParameterMetadata } from './buildCustomNativeControllerMethodParameterMetadata.js';
import { nativeRequestParam } from './nativeRequestParam.js';

export function createCustomNativeParameterDecorator<
  TRequest,
  TResponse,
  TDecoratorResult,
  TResult,
>(
  handler: CustomNativeParameterDecoratorHandler<
    TRequest,
    TResponse,
    TDecoratorResult,
    TResult
  >,
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return nativeRequestParam(
    buildCustomNativeControllerMethodParameterMetadata(
      parameterPipeList,
      handler,
    ),
  );
}
