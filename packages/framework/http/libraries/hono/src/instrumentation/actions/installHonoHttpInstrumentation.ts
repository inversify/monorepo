import { randomUUID } from 'node:crypto';

import {
  closeHttpInstrumentationScope,
  emitHttpInstrumentationEvent,
  type HttpInstrumentationContext,
  type HttpInstrumentationScope,
  type HttpStageClock,
  initializeHttpInstrumentationRequest,
  openHttpInstrumentationScope,
  readHttpStageDuration,
  redactHttpHeaders,
  startHttpStage,
} from '@inversifyjs/http-instrumentation-core';
import { type Context, type Hono, type HonoRequest, type Next } from 'hono';

const HTTP_INTERNAL_SERVER_ERROR_STATUS_CODE: number = 500;

export function installHonoHttpInstrumentation(
  app: Hono,
  instrumentation: HttpInstrumentationContext,
): void {
  app.use(async (context: Context, next: Next): Promise<void> => {
    const request: HonoRequest = context.req as HonoRequest;
    const requestId: string = randomUUID();
    const stage: HttpStageClock = startHttpStage();

    initializeHttpInstrumentationRequest(request, requestId);

    const scope: HttpInstrumentationScope = openHttpInstrumentationScope(
      request,
      randomUUID(),
    );

    emitHttpInstrumentationEvent(
      instrumentation.sinks,
      {
        executionId: scope.executionId,
        headers: redactHttpHeaders(readWebHeaders(request.raw.headers)),
        method: request.method,
        requestId: scope.requestId,
        timestamp: stage.startedAt,
        type: 'http.request.started',
        url: readHonoRequestUrl(request),
      },
      instrumentation.reportSinkError,
    );

    const emitResponseSent: (statusCode: number, headers: Headers) => void = (
      statusCode: number,
      headers: Headers,
    ): void => {
      emitHttpInstrumentationEvent(
        instrumentation.sinks,
        {
          aborted: request.raw.signal.aborted,
          duration: readHttpStageDuration(stage),
          executionId: scope.executionId,
          headers: redactHttpHeaders(readWebHeaders(headers)),
          requestId: scope.requestId,
          startedAt: stage.startedAt,
          statusCode,
          timestamp: Date.now(),
          type: 'http.response.sent',
        },
        instrumentation.reportSinkError,
      );
      closeHttpInstrumentationScope(request, scope.executionId);
    };

    try {
      await next();
    } catch (error: unknown) {
      emitResponseSent(HTTP_INTERNAL_SERVER_ERROR_STATUS_CODE, new Headers());

      throw error;
    }

    const response: Response = context.res;

    emitResponseSent(response.status, response.headers);
  });
}

function readHonoRequestUrl(request: HonoRequest): string {
  const url: URL = new URL(request.url);

  return url.pathname + url.search;
}

function readWebHeaders(
  headers: Headers,
): Record<string, string | readonly string[]> {
  const record: Record<string, string | readonly string[]> = {};

  headers.forEach((value: string, key: string): void => {
    const existing: string | readonly string[] | undefined = record[key];

    if (existing === undefined) {
      record[key] = value;

      return;
    }

    record[key] =
      typeof existing === 'string' ? [existing, value] : [...existing, value];
  });

  return record;
}
