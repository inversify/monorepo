import { Newable } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Pipe } from '../pipe/model/Pipe';
import { requestParam } from './requestParam';

export function buildRequestParameterDecorator(
  parameterType: RequestMethodParameterType,
  parameterPipeList: (Newable<Pipe> | Pipe)[],
  parameterNameOrPipe?: string | (Newable<Pipe> | Pipe),
  customParameterDecoratorHandler?: CustomParameterDecoratorHandler,
): ParameterDecorator {
  let parameterName: string | undefined = undefined;
  const pipeList: (Newable<Pipe> | Pipe)[] = [];

  if (parameterNameOrPipe !== undefined) {
    if (typeof parameterNameOrPipe === 'string') {
      parameterName = parameterNameOrPipe;
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
