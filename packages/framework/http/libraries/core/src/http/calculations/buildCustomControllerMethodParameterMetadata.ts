import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';

export function buildCustomControllerMethodParameterMetadata(
  parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  handler: CustomParameterDecoratorHandler,
): ControllerMethodParameterMetadata {
  return {
    customParameterDecoratorHandler: handler,
    parameterName: undefined,
    parameterType: RequestMethodParameterType.Custom,
    pipeList: parameterPipeList,
  };
}
