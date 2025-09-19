import { isPipe, Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParamOptions } from '../models/RouteParamOptions';
import { requestParam } from './requestParam';

export function buildRouteParameterDecorator(
  parameterType: RequestMethodParameterType,
  parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  parameterNameOrPipe?: RouteParamOptions | (ServiceIdentifier<Pipe> | Pipe),
  customParameterDecoratorHandler?: CustomParameterDecoratorHandler,
): ParameterDecorator {
  let parameterName: string | undefined = undefined;
  const pipeList: (ServiceIdentifier<Pipe> | Pipe)[] = [];

  if (parameterNameOrPipe !== undefined) {
    if (
      typeof parameterNameOrPipe === 'object' &&
      !isPipe(parameterNameOrPipe)
    ) {
      parameterName = parameterNameOrPipe.name;
    } else {
      pipeList.push(parameterNameOrPipe);
    }
  }

  if (parameterPipeList.length > 0) {
    pipeList.push(...parameterPipeList);
  }

  const controllerMethodParameterMetadata: ControllerMethodParameterMetadata = {
    customParameterDecoratorHandler,
    parameterName,
    parameterType,
    pipeList,
  };

  return requestParam(controllerMethodParameterMetadata);
}
