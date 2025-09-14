import {
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/framework-core';
import { Container, Newable } from 'inversify';

import { RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata';
import { Controller } from '../models/Controller';
import { ControllerResponse } from '../models/ControllerResponse';
import { RequestHandler } from '../models/RequestHandler';

export function buildInterceptedHandler<
  TRequest,
  TResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction extends (err?: any) => Promise<void> | void,
  TResult,
>(
  targetClass: NewableFunction,
  routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
    TRequest,
    TResponse,
    unknown
  >,
  container: Container,
  buildHandlerParams: (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ) => Promise<unknown[]>,
  handleError: (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult>,
  reply: (req: TRequest, res: TResponse, value: ControllerResponse) => TResult,
  setHeaders: (
    request: TRequest,
    response: TResponse,
    headerList: [string, string][],
  ) => void,
): RequestHandler<TRequest, TResponse, TNextFunction, TResult> {
  if (routerExplorerControllerMethodMetadata.interceptorList.length === 0) {
    return async (
      request: TRequest,
      response: TResponse,
      next: TNextFunction,
    ): Promise<TResult> => {
      try {
        const controller: Controller = await container.getAsync(targetClass);

        const handlerParams: unknown[] = await buildHandlerParams(
          request,
          response,
          next,
        );

        setHeaders(
          request,
          response,
          routerExplorerControllerMethodMetadata.headerMetadataList,
        );

        const value: ControllerResponse = await controller[
          routerExplorerControllerMethodMetadata.methodKey
        ]?.(...handlerParams);

        return reply(request, response, value);
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
      if (
        index < routerExplorerControllerMethodMetadata.interceptorList.length
      ) {
        return async (): Promise<InterceptorTransformObject> => {
          const interceptor: Interceptor<TRequest, TResponse> =
            await container.getAsync(
              routerExplorerControllerMethodMetadata.interceptorList[
                index
              ] as Newable<Interceptor<TRequest, TResponse>>,
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
          const controller: Controller = await container.getAsync(targetClass);

          const handlerParams: unknown[] = await buildHandlerParams(
            request,
            response,
            next,
          );

          setHeaders(
            request,
            response,
            routerExplorerControllerMethodMetadata.headerMetadataList,
          );

          handlerResult = await controller[
            routerExplorerControllerMethodMetadata.methodKey
          ]?.(...handlerParams);

          return transformObject;
        };
      }
    };

    try {
      await nextFunction(0)();

      for (const transform of transforms) {
        handlerResult = (await transform(handlerResult)) as ControllerResponse;
      }

      return reply(request, response, handlerResult);
    } catch (error: unknown) {
      return handleError(request, response, error);
    }
  };
}
