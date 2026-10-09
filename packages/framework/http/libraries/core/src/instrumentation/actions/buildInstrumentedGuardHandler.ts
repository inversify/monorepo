import { type Guard } from '@inversifyjs/framework-core';
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

type GuardStageResult<TResult> =
  | {
      readonly allowed: boolean;
    }
  | {
      readonly handled: true;
      readonly result: TResult;
    };

export function buildInstrumentedGuardHandler<
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
  guardServiceIdentifier: ServiceIdentifier<Guard<TRequest>>,
  replyForbidden: (
    request: TRequest,
    response: TResponse,
  ) => Promise<TResult | undefined> | TResult | undefined,
): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult | undefined> {
  const guardName: string = describeServiceIdentifier(guardServiceIdentifier);

  const handler: MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult | undefined
  > = async (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<TResult | undefined> => {
    const outcome: GuardStageResult<TResult> = await runInstrumentedHttpStage<
      GuardStageResult<TResult>
    >(
      instrumentation,
      request as object,
      (scope: HttpInstrumentationScope, stage: HttpStageClock) => ({
        executionId: scope.executionId,
        guard: guardName,
        ...(scope.parentExecutionId === undefined
          ? {}
          : { parentExecutionId: scope.parentExecutionId }),
        requestId: scope.requestId,
        timestamp: stage.startedAt,
        type: 'http.guard.started',
      }),
      async (): Promise<GuardStageResult<TResult>> => {
        const guard: Guard<TRequest> = await container.getAsync(
          guardServiceIdentifier,
        );

        return {
          allowed: await guard.activate(request),
        };
      },
      (
        scope: HttpInstrumentationScope,
        stage: HttpStageClock,
        stageOutcome: HttpStageOutcome<GuardStageResult<TResult>>,
      ) => {
        if ('error' in stageOutcome) {
          return {
            duration: readHttpStageDuration(stage),
            error: stageOutcome.error,
            executionId: scope.executionId,
            guard: guardName,
            ...(scope.parentExecutionId === undefined
              ? {}
              : { parentExecutionId: scope.parentExecutionId }),
            requestId: scope.requestId,
            startedAt: stage.startedAt,
            timestamp: Date.now(),
            type: 'http.guard.executed' as const,
          };
        }

        return {
          allowed:
            'allowed' in stageOutcome.result
              ? stageOutcome.result.allowed
              : false,
          duration: readHttpStageDuration(stage),
          executionId: scope.executionId,
          guard: guardName,
          ...(scope.parentExecutionId === undefined
            ? {}
            : { parentExecutionId: scope.parentExecutionId }),
          requestId: scope.requestId,
          startedAt: stage.startedAt,
          timestamp: Date.now(),
          type: 'http.guard.executed' as const,
        };
      },
      async (error: unknown): Promise<GuardStageResult<TResult>> => ({
        handled: true,
        result: await handleError(request, response, error),
      }),
    );

    if ('handled' in outcome) {
      return outcome.result;
    }

    if (outcome.allowed) {
      await next();

      return undefined;
    }

    return replyForbidden(request, response);
  };

  markHttpInstrumentedHandler(handler);

  return handler;
}
