import {
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/framework-core';
import { Container, ServiceIdentifier } from 'inversify';

import { ControllerResponse } from '../models/ControllerResponse';
import { RequestHandler } from '../models/RequestHandler';

export function buildInterceptedHandler<
  TRequest,
  TResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction extends (err?: any) => Promise<void> | void,
  TResult,
>(
  interceptorList: ServiceIdentifier<Interceptor<TRequest, TResponse>>[],
  container: Container,
  callRouteHandler: (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ) => Promise<ControllerResponse>,
  handleError: (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult>,
  reply: (
    req: TRequest,
    res: TResponse,
    value: ControllerResponse,
  ) => TResult | Promise<TResult>,
): RequestHandler<TRequest, TResponse, TNextFunction, TResult> {
  if (interceptorList.length === 0) {
    return async (
      request: TRequest,
      response: TResponse,
      next: TNextFunction,
    ): Promise<TResult> => {
      try {
        const value: ControllerResponse = await callRouteHandler(
          request,
          response,
          next,
        );

        return await reply(request, response, value);
      } catch (error: unknown) {
        return handleError(request, response, error);
      }
    };
  }

  return async (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<TResult> => {
    const transforms: ((value: unknown) => unknown)[] = [];

    const transformObject: InterceptorTransformObject = {
      push: (transform: (value: unknown) => unknown) => {
        transforms.push(transform);
      },
    };

    let handlerResult: ControllerResponse | undefined;

    const nextFunction: (
      index: number,
    ) => () => Promise<InterceptorTransformObject> = (
      index: number,
    ): (() => Promise<InterceptorTransformObject>) => {
      if (index < interceptorList.length) {
        return async (): Promise<InterceptorTransformObject> => {
          const interceptor: Interceptor<TRequest, TResponse> =
            await container.getAsync(
              interceptorList[index] as ServiceIdentifier<
                Interceptor<TRequest, TResponse>
              >,
            );

          await interceptor.intercept(
            request,
            response,
            nextFunction(index + 1),
          );

          return transformObject;
        };
      } else {
        return async (): Promise<InterceptorTransformObject> => {
          handlerResult = await callRouteHandler(request, response, next);

          return transformObject;
        };
      }
    };

    try {
      await nextFunction(0)();

      for (const transform of transforms) {
        handlerResult = (await transform(handlerResult)) as ControllerResponse;
      }

      return await reply(request, response, handlerResult);
    } catch (error: unknown) {
      return handleError(request, response, error);
    }
  };
}
