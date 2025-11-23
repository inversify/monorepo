import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

export function buildCustomNativeControllerMethodParameterMetadata(
  parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  handler: CustomNativeParameterDecoratorHandler,
): ControllerMethodParameterMetadata {
  return {
    customParameterDecoratorHandler: handler,
    parameterName: undefined,
    parameterType: RequestMethodParameterType.CustomNative,
    pipeList: parameterPipeList,
  };
}
