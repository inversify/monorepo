import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type NonCustomRequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { type RouteParamOptions } from '../models/RouteParamOptions.js';

export function buildNonCustomControllerMethodParameterMetadata(
  parameterType: NonCustomRequestMethodParameterType,
  parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  options: RouteParamOptions | undefined,
): ControllerMethodParameterMetadata {
  return {
    parameterName: options?.name,
    parameterType,
    pipeList: parameterPipeList,
  };
}
