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
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

const uwsHttpResponseObservationSymbol: unique symbol = Symbol(
  '@inversifyjs/http-uwebsockets/httpResponseObservation',
);

const DEFAULT_STATUS_CODE: number = 200;

interface UwsHttpResponseObservation {
  completed: boolean;
  readonly executionId: string;
  finishStream: ((aborted: boolean) => void) | undefined;
  readonly headers: Record<string, string | string[]>;
  readonly requestId: string;
  readonly stage: HttpStageClock;
  statusCode: number;
  streamPending: boolean;
}

interface UwsHttpResponseObservationCarrier {
  [uwsHttpResponseObservationSymbol]?: UwsHttpResponseObservation | undefined;
}

export function startUwsHttpRequestObservation(
  request: HttpRequest,
  response: HttpResponse,
  instrumentation: HttpInstrumentationContext,
): UwsHttpResponseObservation {
  const requestId: string = randomUUID();
  const stage: HttpStageClock = startHttpStage();

  initializeHttpInstrumentationRequest(request, requestId);

  const scope: HttpInstrumentationScope = openHttpInstrumentationScope(
    request,
    randomUUID(),
  );
  const requestHeaders: Record<string, string | string[]> =
    readUwsRequestHeaders(request);
  const observation: UwsHttpResponseObservation = {
    completed: false,
    executionId: scope.executionId,
    finishStream: undefined,
    headers: {},
    requestId: scope.requestId,
    stage,
    statusCode: DEFAULT_STATUS_CODE,
    streamPending: false,
  };

  emitHttpInstrumentationEvent(
    instrumentation.sinks,
    {
      executionId: scope.executionId,
      headers: redactHttpHeaders(requestHeaders),
      method: request.getMethod().toUpperCase(),
      requestId: scope.requestId,
      timestamp: stage.startedAt,
      type: 'http.request.started',
      url: readUwsRequestUrl(request),
    },
    instrumentation.reportSinkError,
  );

  writeUwsHttpResponseObservation(response, observation);

  return observation;
}

export function finishUwsHttpRequestObservation(
  request: HttpRequest,
  response: HttpResponse,
  observation: UwsHttpResponseObservation,
  instrumentation: HttpInstrumentationContext,
  aborted: boolean,
): void {
  if (observation.completed || observation.streamPending) {
    return;
  }

  observation.completed = true;
  clearUwsHttpResponseObservation(response);

  emitHttpInstrumentationEvent(
    instrumentation.sinks,
    {
      aborted,
      duration: readHttpStageDuration(observation.stage),
      executionId: observation.executionId,
      headers: redactHttpHeaders(observation.headers),
      requestId: observation.requestId,
      startedAt: observation.stage.startedAt,
      statusCode: observation.statusCode,
      timestamp: Date.now(),
      type: 'http.response.sent',
    },
    instrumentation.reportSinkError,
  );
  closeHttpInstrumentationScope(request, observation.executionId);
}

export function bindUwsHttpResponseStream(
  response: HttpResponse,
  finishStream: (aborted: boolean) => void,
): void {
  const observation: UwsHttpResponseObservation | undefined =
    readUwsHttpResponseObservation(response);

  if (observation === undefined) {
    return;
  }

  observation.finishStream = finishStream;
}

export function markUwsHttpResponseStreamPending(response: HttpResponse): void {
  const observation: UwsHttpResponseObservation | undefined =
    readUwsHttpResponseObservation(response);

  if (observation === undefined || observation.completed) {
    return;
  }

  observation.streamPending = true;
}

export function completeUwsHttpResponseStream(
  response: HttpResponse,
  aborted: boolean,
): void {
  const observation: UwsHttpResponseObservation | undefined =
    readUwsHttpResponseObservation(response);

  if (observation === undefined || observation.completed) {
    return;
  }

  observation.streamPending = false;
  observation.finishStream?.(aborted);
}

export function recordUwsHttpStatus(
  response: HttpResponse,
  statusCode: number,
): void {
  const observation: UwsHttpResponseObservation | undefined =
    readUwsHttpResponseObservation(response);

  if (observation === undefined || observation.completed) {
    return;
  }

  observation.statusCode = statusCode;
}

export function recordUwsHttpHeader(
  response: HttpResponse,
  key: string,
  value: string,
): void {
  const observation: UwsHttpResponseObservation | undefined =
    readUwsHttpResponseObservation(response);

  if (observation === undefined || observation.completed) {
    return;
  }

  const existing: string | string[] | undefined = observation.headers[key];

  if (existing === undefined) {
    observation.headers[key] = value;

    return;
  }

  observation.headers[key] =
    typeof existing === 'string' ? [existing, value] : [...existing, value];
}

function readUwsRequestHeaders(
  request: HttpRequest,
): Record<string, string | string[]> {
  const headers: Record<string, string | string[]> = {};

  request.forEach((key: string, value: string): void => {
    const existing: string | string[] | undefined = headers[key];

    if (existing === undefined) {
      headers[key] = value;

      return;
    }

    headers[key] =
      typeof existing === 'string' ? [existing, value] : [...existing, value];
  });

  return headers;
}

function readUwsRequestUrl(request: HttpRequest): string {
  const query: string = request.getQuery();

  return query === '' ? request.getUrl() : `${request.getUrl()}?${query}`;
}

function readUwsHttpResponseObservation(
  response: HttpResponse,
): UwsHttpResponseObservation | undefined {
  return (response as UwsHttpResponseObservationCarrier)[
    uwsHttpResponseObservationSymbol
  ];
}

function writeUwsHttpResponseObservation(
  response: HttpResponse,
  observation: UwsHttpResponseObservation,
): void {
  (response as UwsHttpResponseObservationCarrier)[
    uwsHttpResponseObservationSymbol
  ] = observation;
}

function clearUwsHttpResponseObservation(response: HttpResponse): void {
  (response as UwsHttpResponseObservationCarrier)[
    uwsHttpResponseObservationSymbol
  ] = undefined;
}
