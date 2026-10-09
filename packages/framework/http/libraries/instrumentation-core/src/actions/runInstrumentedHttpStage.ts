import { randomUUID } from 'node:crypto';

import { startHttpStage } from '../calculations/startHttpStage.js';
import { type HttpInstrumentationContext } from '../models/HttpInstrumentationContext.js';
import { type HttpInstrumentationEvent } from '../models/HttpInstrumentationEvent.js';
import { type HttpInstrumentationScope } from '../models/HttpInstrumentationScope.js';
import { type HttpStageClock } from '../models/HttpStageClock.js';
import { emitHttpInstrumentationEvent } from './emitHttpInstrumentationEvent.js';
import {
  closeHttpInstrumentationScope,
  openHttpInstrumentationScope,
} from './httpInstrumentationState.js';

export type HttpStageOutcome<TResult> =
  | {
      readonly error: unknown;
    }
  | {
      readonly result: TResult;
    };

export async function runInstrumentedHttpStage<TResult>(
  instrumentation: HttpInstrumentationContext,
  request: object,
  createStartedEvent: (
    scope: HttpInstrumentationScope,
    stage: HttpStageClock,
  ) => HttpInstrumentationEvent,
  operation: () => Promise<TResult>,
  createExecutedEvent: (
    scope: HttpInstrumentationScope,
    stage: HttpStageClock,
    outcome: HttpStageOutcome<TResult>,
  ) => HttpInstrumentationEvent,
  recover: (error: unknown) => Promise<TResult>,
): Promise<TResult> {
  const scope: HttpInstrumentationScope = openHttpInstrumentationScope(
    request,
    randomUUID(),
  );
  const stage: HttpStageClock = startHttpStage();

  try {
    emitHttpInstrumentationEvent(
      instrumentation.sinks,
      createStartedEvent(scope, stage),
      instrumentation.reportSinkError,
    );

    try {
      const result: TResult = await operation();

      emitHttpInstrumentationEvent(
        instrumentation.sinks,
        createExecutedEvent(scope, stage, {
          result,
        }),
        instrumentation.reportSinkError,
      );

      return result;
    } catch (error: unknown) {
      emitHttpInstrumentationEvent(
        instrumentation.sinks,
        createExecutedEvent(scope, stage, {
          error,
        }),
        instrumentation.reportSinkError,
      );

      return await recover(error);
    }
  } finally {
    closeHttpInstrumentationScope(request, scope.executionId);
  }
}
