import { randomUUID } from 'node:crypto';

import { type ServiceIdentifier } from '@inversifyjs/common';
import { type ErrorFilter } from '@inversifyjs/framework-core';
import {
  closeHttpInstrumentationScope,
  emitHttpInstrumentationEvent,
  type HttpInstrumentationContext,
  type HttpInstrumentationScope,
  type HttpStageClock,
  openHttpInstrumentationScope,
  readHttpStageDuration,
  startHttpStage,
} from '@inversifyjs/http-instrumentation-core';

import { describeServiceIdentifier } from '../calculations/describeServiceIdentifier.js';

export function buildInstrumentedHandleError<TRequest, TResponse, TResult>(
  instrumentation: HttpInstrumentationContext,
  resolveErrorFilter: (
    error: unknown,
  ) => Promise<ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined>,
  replyUnresolved: (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult> | TResult,
): (
  request: TRequest,
  response: TResponse,
  error: unknown,
) => Promise<TResult> {
  const handleError: (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult> = async (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ): Promise<TResult> => {
    const scope: HttpInstrumentationScope = openHttpInstrumentationScope(
      request as object,
      randomUUID(),
    );
    const stage: HttpStageClock = startHttpStage();

    const emitError: (filter?: string, emittedError?: unknown) => void = (
      filter?: string,
      emittedError: unknown = error,
    ): void => {
      emitHttpInstrumentationEvent(
        instrumentation.sinks,
        {
          duration: readHttpStageDuration(stage),
          error: emittedError,
          executionId: scope.executionId,
          ...(filter === undefined ? {} : { filter }),
          ...(scope.parentExecutionId === undefined
            ? {}
            : { parentExecutionId: scope.parentExecutionId }),
          requestId: scope.requestId,
          startedAt: stage.startedAt,
          timestamp: Date.now(),
          type: 'http.error',
        },
        instrumentation.reportSinkError,
      );
    };

    try {
      const errorFilter:
        ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined =
        await resolveErrorFilter(error);

      if (errorFilter === undefined) {
        try {
          const result: TResult = await replyUnresolved(
            request,
            response,
            error,
          );

          emitError();

          return result;
        } catch (replyError: unknown) {
          emitError(undefined, replyError);

          throw replyError;
        }
      }

      const filterName: string = describeServiceIdentifier(
        errorFilter.constructor as ServiceIdentifier,
      );

      try {
        const result: TResult = await errorFilter.catch(
          error,
          request,
          response,
        );

        emitError(filterName);

        return result;
      } catch (filterError: unknown) {
        emitError(filterName, filterError);

        return await handleError(request, response, filterError);
      }
    } finally {
      closeHttpInstrumentationScope(request as object, scope.executionId);
    }
  };

  return handleError;
}
