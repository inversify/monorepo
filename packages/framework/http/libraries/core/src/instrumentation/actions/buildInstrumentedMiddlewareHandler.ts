import {
  type Middleware,
  type MiddlewarePhase,
} from '@inversifyjs/framework-core';
import {
  type HttpInstrumentationContext,
  type HttpInstrumentationScope,
  type HttpStageClock,
  type HttpStageOutcome,
  markHttpInstrumentedHandler,
  readHttpStageDuration,
  runInstrumentedHttpStage,
} from '@inversifyjs/http-instrumentation-core';
import { type Container, type ServiceIdentifier } from 'inversify';

import { type MiddlewareHandler } from '../../http/models/MiddlewareHandler.js';
import { describeServiceIdentifier } from '../calculations/describeServiceIdentifier.js';

export function buildInstrumentedMiddlewareHandler<
  TRequest,
  TResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction extends (err?: any) => Promise<void> | void,
  TResult,
>(
  instrumentation: HttpInstrumentationContext,
  container: Container,
  handleError: (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult>,
  middlewareServiceIdentifier: ServiceIdentifier<
    Middleware<TRequest, TResponse, TNextFunction, TResult>
  >,
  phase: MiddlewarePhase,
): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult> {
  const middlewareName: string = describeServiceIdentifier(
    middlewareServiceIdentifier,
  );

  const handler: MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult
  > = async (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<TResult> =>
    runInstrumentedHttpStage(
      instrumentation,
      request as object,
      (scope: HttpInstrumentationScope, stage: HttpStageClock) => ({
        executionId: scope.executionId,
        middleware: middlewareName,
        ...(scope.parentExecutionId === undefined
          ? {}
          : { parentExecutionId: scope.parentExecutionId }),
        phase,
        requestId: scope.requestId,
        timestamp: stage.startedAt,
        type: 'http.middleware.started',
      }),
      async (): Promise<TResult> => {
        const middleware: Middleware<
          TRequest,
          TResponse,
          TNextFunction,
          TResult
        > = await container.getAsync(middlewareServiceIdentifier);

        return middleware.execute(request, response, next);
      },
      (
        scope: HttpInstrumentationScope,
        stage: HttpStageClock,
        outcome: HttpStageOutcome<TResult>,
      ) => ({
        duration: readHttpStageDuration(stage),
        ...('error' in outcome ? { error: outcome.error } : {}),
        executionId: scope.executionId,
        middleware: middlewareName,
        ...(scope.parentExecutionId === undefined
          ? {}
          : { parentExecutionId: scope.parentExecutionId }),
        phase,
        requestId: scope.requestId,
        startedAt: stage.startedAt,
        timestamp: Date.now(),
        type: 'http.middleware.executed',
      }),
      async (error: unknown): Promise<TResult> =>
        handleError(request, response, error),
    );

  markHttpInstrumentedHandler(handler);

  return handler;
}
