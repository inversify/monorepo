import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { NonCustomRequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParamOptions } from '../models/RouteParamOptions';

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
