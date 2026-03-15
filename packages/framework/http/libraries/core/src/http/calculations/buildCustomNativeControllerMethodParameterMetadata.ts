import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';

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
