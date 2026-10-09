import {
  type Interceptor,
  type InterceptorTransformObject,
} from '@inversifyjs/framework-core';
import {
  type HttpInstrumentationContext,
  type HttpInstrumentationScope,
  type HttpStageClock,
  type HttpStageOutcome,
  readHttpStageDuration,
  runInstrumentedHttpStage,
} from '@inversifyjs/http-instrumentation-core';
import { type Container, type ServiceIdentifier } from 'inversify';

import { type ControllerResponse } from '../../http/models/ControllerResponse.js';
import { type RequestHandler } from '../../http/models/RequestHandler.js';
import { describeServiceIdentifier } from '../calculations/describeServiceIdentifier.js';

export function buildInstrumentedInterceptedHandler<
  TRequest,
  TResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction extends (err?: any) => Promise<void> | void,
  TResult,
>(
  instrumentation: HttpInstrumentationContext,
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
    request: TRequest,
    response: TResponse,
    value: ControllerResponse,
  ) => Promise<TResult> | TResult,
): RequestHandler<TRequest, TResponse, TNextFunction, TResult> {
  return async (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<TResult> => {
    const transforms: ((value: unknown) => unknown)[] = [];
    const transformObject: InterceptorTransformObject = {
      push: (transform: (value: unknown) => unknown): void => {
        transforms.push(transform);
      },
    };
    let handlerResult: ControllerResponse | undefined;

    const nextFunction: (
      index: number,
    ) => () => Promise<InterceptorTransformObject> = (
      index: number,
    ): (() => Promise<InterceptorTransformObject>) => {
      const interceptorIdentifier:
        ServiceIdentifier<Interceptor<TRequest, TResponse>> | undefined =
        interceptorList[index];

      if (interceptorIdentifier === undefined) {
        return async (): Promise<InterceptorTransformObject> => {
          handlerResult = await callRouteHandler(request, response, next);

          return transformObject;
        };
      }

      const interceptorName: string = describeServiceIdentifier(
        interceptorIdentifier,
      );

      return async (): Promise<InterceptorTransformObject> => {
        const interceptor: Interceptor<TRequest, TResponse> =
          await container.getAsync(interceptorIdentifier);

        await runInstrumentedHttpStage(
          instrumentation,
          request as object,
          (scope: HttpInstrumentationScope, stage: HttpStageClock) => ({
            executionId: scope.executionId,
            interceptor: interceptorName,
            ...(scope.parentExecutionId === undefined
              ? {}
              : { parentExecutionId: scope.parentExecutionId }),
            requestId: scope.requestId,
            timestamp: stage.startedAt,
            type: 'http.interceptor.started',
          }),
          async (): Promise<void> => {
            await interceptor.intercept(
              request,
              response,
              nextFunction(index + 1),
            );
          },
          (
            scope: HttpInstrumentationScope,
            stage: HttpStageClock,
            outcome: HttpStageOutcome<void>,
          ) => ({
            duration: readHttpStageDuration(stage),
            ...('error' in outcome ? { error: outcome.error } : {}),
            executionId: scope.executionId,
            interceptor: interceptorName,
            ...(scope.parentExecutionId === undefined
              ? {}
              : { parentExecutionId: scope.parentExecutionId }),
            requestId: scope.requestId,
            startedAt: stage.startedAt,
            timestamp: Date.now(),
            type: 'http.interceptor.executed',
          }),
          async (error: unknown): Promise<void> => {
            throw error;
          },
        );

        return transformObject;
      };
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
