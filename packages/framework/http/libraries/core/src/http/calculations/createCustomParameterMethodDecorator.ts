import { decoratorFinalizersMetadataKey, type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler.js';
import { buildCustomControllerMethodParameterMetadata } from './buildCustomControllerMethodParameterMetadata.js';
import { setControllerMethodParameterMetadataByName } from '../../routerExplorer/actions/setControllerMethodParameterMetadataByName.js';
import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';

export function createCustomParameterMethodDecorator<TRequest, TResponse, TResult>(
  handler: CustomParameterDecoratorHandler<TRequest, TResponse, TResult>,
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): (
  paramName: string,
) => (value: Function, context: ClassMethodDecoratorContext) => void {
  const metadata: ControllerMethodParameterMetadata =
    buildCustomControllerMethodParameterMetadata(parameterPipeList, handler);

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
      });
    };
}
