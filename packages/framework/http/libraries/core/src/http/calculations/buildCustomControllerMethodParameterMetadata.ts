import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';

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
