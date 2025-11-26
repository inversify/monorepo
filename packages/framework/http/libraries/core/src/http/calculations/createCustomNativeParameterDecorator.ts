import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler';
import { buildCustomNativeControllerMethodParameterMetadata } from './buildCustomNativeControllerMethodParameterMetadata';
import { nativeRequestParam } from './nativeRequestParam';

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
