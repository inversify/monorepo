import { isPipe, Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import {
  CustomRequestMethodParameterType,
  NonCustomRequestMethodParameterType,
  RequestMethodParameterType,
} from '../models/RequestMethodParameterType';
import { RouteParamOptions } from '../models/RouteParamOptions';
import { requestParam } from './requestParam';

export function buildRouteParameterDecorator(
  parameterType: CustomRequestMethodParameterType,
  parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  parameterNameOrPipe:
    | RouteParamOptions
    | (ServiceIdentifier<Pipe> | Pipe)
    | undefined,
  customParameterDecoratorHandler: CustomParameterDecoratorHandler,
): ParameterDecorator;
export function buildRouteParameterDecorator(
  parameterType: NonCustomRequestMethodParameterType,
  parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  parameterNameOrPipe?: RouteParamOptions | (ServiceIdentifier<Pipe> | Pipe),
): ParameterDecorator;
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

  const controllerMethodParameterMetadata: ControllerMethodParameterMetadata =
    parameterType === RequestMethodParameterType.Custom
      ? {
          customParameterDecoratorHandler:
            customParameterDecoratorHandler as CustomParameterDecoratorHandler,
          parameterName,
          parameterType,
          pipeList,
        }
      : {
          parameterName,
          parameterType,
          pipeList,
        };

  return requestParam(controllerMethodParameterMetadata);
}
