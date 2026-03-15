import { type Container, type ServiceIdentifier } from 'inversify';

import { type Controller } from '../models/Controller.js';
import { type ControllerFunction } from '../models/ControllerFunction.js';
import { type ControllerResponse } from '../models/ControllerResponse.js';

export function buildSyncCallRouteHandler<TRequest, TResponse, TNextFunction>(
  container: Container,
  serviceIdentifier: ServiceIdentifier,
  controllerMethodKey: string | symbol,
  paramBuilders: (
    | ((request: TRequest, response: TResponse, next: TNextFunction) => unknown)
    | undefined
  )[],
): (
  request: TRequest,
  response: TResponse,
  next: TNextFunction,
) => Promise<ControllerResponse> {
  return async (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<ControllerResponse> => {
    const controller: Controller = await container.getAsync(
      serviceIdentifier as ServiceIdentifier<Controller>,
    );

    const params: unknown[] = new Array(paramBuilders.length);

    for (let index: number = 0; index < paramBuilders.length; index++) {
      const paramBuilder:
        | ((
            request: TRequest,
            response: TResponse,
            next: TNextFunction,
          ) => unknown)
        | undefined = paramBuilders[index];

      if (paramBuilder !== undefined) {
        params[index] = paramBuilder(request, response, next);
      }
    }

    return (controller[controllerMethodKey] as ControllerFunction)(...params);
  };
}
