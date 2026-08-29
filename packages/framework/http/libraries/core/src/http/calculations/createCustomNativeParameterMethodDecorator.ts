import { decoratorFinalizersMetadataKey, type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { setControllerMethodParameterMetadataByName } from '../../routerExplorer/actions/setControllerMethodParameterMetadataByName.js';
import { setControllerMethodUseNativeHandlerMetadata } from '../../routerExplorer/actions/setControllerMethodUseNativeHandlerMetadata.js';
import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler.js';
import { buildCustomNativeControllerMethodParameterMetadata } from './buildCustomNativeControllerMethodParameterMetadata.js';

export function createCustomNativeParameterMethodDecorator<
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
): (
  paramName: string,
) => (value: Function, context: ClassMethodDecoratorContext) => void {
  const metadata: ControllerMethodParameterMetadata =
    buildCustomNativeControllerMethodParameterMetadata(
      parameterPipeList,
      handler,
    );

  return (paramName: string) =>
    (_value: Function, context: ClassMethodDecoratorContext): void => {
      const finalizers: Array<(cls: object) => void> =
        ((context.metadata as Record<symbol, unknown>)[decoratorFinalizersMetadataKey] ??= []) as Array<(cls: object) => void>;
      finalizers.push((cls: object) => {
        setControllerMethodParameterMetadataByName(
          { [paramName]: metadata },
          cls as Function,
          context.name,
        );
        setControllerMethodUseNativeHandlerMetadata(cls as Function, context.name);
      });
    };
}
