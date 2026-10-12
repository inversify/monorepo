import {
  type EventSink,
  type HttpInstrumentationEvent,
} from '@inversifyjs/http-instrumentation-core';
import {
  type Attributes,
  context,
  type Histogram,
  type Meter,
  metrics,
  propagation,
  type Span,
  SpanKind,
  SpanStatusCode,
  type TextMapGetter,
  trace,
  type Tracer,
  type UpDownCounter,
} from '@opentelemetry/api';

import { buildHttpHeaderAttributes } from '../calculations/buildHttpHeaderAttributes.js';
import { readHttpRequestDurationSeconds } from '../calculations/readHttpRequestDurationSeconds.js';
import { splitHttpUrl } from '../calculations/splitHttpUrl.js';
import { type HttpOpenTelemetrySinkOptions } from '../models/HttpOpenTelemetrySinkOptions.js';

const DEFAULT_INSTRUMENT_NAME: string = '@inversifyjs/http-opentelemetry';
const HTTP_SERVER_ERROR_STATUS_CODE: number = 500;
const REQUEST_DURATION_METRIC: string = 'http.server.request.duration';
const ACTIVE_REQUESTS_METRIC: string = 'http.server.active_requests';

const headerGetter: TextMapGetter<
  Readonly<Record<string, string | readonly string[]>>
> = {
  get: (
    carrier: Readonly<Record<string, string | readonly string[]>>,
    key: string,
  ): string | string[] | undefined => {
    const value: string | readonly string[] | undefined =
      carrier[key] ?? carrier[key.toLowerCase()];

    if (value === undefined) {
      return undefined;
    }

    return typeof value === 'string' ? value : [...value];
  },
  keys: (
    carrier: Readonly<Record<string, string | readonly string[]>>,
  ): string[] => Object.keys(carrier),
};

interface ActiveSpan {
  readonly method: string | undefined;
  readonly span: Span;
  readonly startTimestamp: number | undefined;
}

export function createHttpOpenTelemetrySink(
  options: HttpOpenTelemetrySinkOptions = {},
): EventSink<HttpInstrumentationEvent> {
  const tracer: Tracer =
    options.tracer ??
    trace.getTracer(options.tracerName ?? DEFAULT_INSTRUMENT_NAME);
  const meter: Meter =
    options.meter ??
    metrics.getMeter(options.meterName ?? DEFAULT_INSTRUMENT_NAME);
  const requestDuration: Histogram = meter.createHistogram(
    REQUEST_DURATION_METRIC,
    {
      description: 'Duration of inbound HTTP requests',
      unit: 's',
    },
  );
  const activeRequests: UpDownCounter = meter.createUpDownCounter(
    ACTIVE_REQUESTS_METRIC,
    {
      description: 'Number of in-flight inbound HTTP requests',
      unit: '{request}',
    },
  );
  const spans: Map<string, ActiveSpan> = new Map();

  const openSpan: (
    executionId: string,
    parentExecutionId: string | undefined,
    name: string,
    startTime: number,
    attributes: Attributes,
    kind?: SpanKind,
    parentContext?: ReturnType<typeof context.active>,
    method?: string,
  ) => void = (
    executionId: string,
    parentExecutionId: string | undefined,
    name: string,
    startTime: number,
    attributes: Attributes,
    kind?: SpanKind,
    parentContext?: ReturnType<typeof context.active>,
    method?: string,
  ): void => {
    const parentSpan: Span | undefined =
      parentExecutionId === undefined
        ? undefined
        : spans.get(parentExecutionId)?.span;
    const spanContext: ReturnType<typeof context.active> =
      parentContext ??
      (parentSpan === undefined
        ? context.active()
        : trace.setSpan(context.active(), parentSpan));
    const span: Span = tracer.startSpan(
      name,
      {
        attributes,
        ...(kind === undefined ? {} : { kind }),
        startTime,
      },
      spanContext,
    );

    spans.set(executionId, {
      method,
      span,
      startTimestamp: method === undefined ? undefined : startTime,
    });
  };

  const endSpan: (
    executionId: string,
    endTime: number,
    finalize: (span: Span, active: ActiveSpan) => void,
  ) => void = (
    executionId: string,
    endTime: number,
    finalize: (span: Span, active: ActiveSpan) => void,
  ): void => {
    const active: ActiveSpan | undefined = spans.get(executionId);

    if (active === undefined) {
      return;
    }

    spans.delete(executionId);
    finalize(active.span, active);
    active.span.end(endTime);
  };

  const recordFailure: (span: Span, error: unknown) => void = (
    span: Span,
    error: unknown,
  ): void => {
    span.recordException(error instanceof Error ? error : String(error));
    span.setStatus({ code: SpanStatusCode.ERROR });
  };

  return {
    emit: (event: HttpInstrumentationEvent): void => {
      switch (event.type) {
        case 'http.request.started': {
          const url: ReturnType<typeof splitHttpUrl> = splitHttpUrl(event.url);

          openSpan(
            event.executionId,
            undefined,
            `HTTP ${event.method}`,
            event.timestamp,
            {
              ...buildHttpHeaderAttributes(
                'http.request.header',
                event.headers,
              ),
              'http.request.method': event.method,
              'url.path': url.path,
              ...(url.query === undefined ? {} : { 'url.query': url.query }),
            },
            SpanKind.SERVER,
            propagation.extract(context.active(), event.headers, headerGetter),
            event.method,
          );
          activeRequests.add(1, {
            'http.request.method': event.method,
          });

          return;
        }
        case 'http.response.sent': {
          endSpan(
            event.executionId,
            event.timestamp,
            (span: Span, active: ActiveSpan): void => {
              span.setAttribute('http.response.status_code', event.statusCode);
              span.setAttributes(
                buildHttpHeaderAttributes(
                  'http.response.header',
                  event.headers,
                ),
              );

              if (event.aborted) {
                span.setAttribute('error.type', 'abort');
              }

              if (
                event.aborted ||
                event.statusCode >= HTTP_SERVER_ERROR_STATUS_CODE
              ) {
                span.setStatus({ code: SpanStatusCode.ERROR });
              }

              if (
                active.method !== undefined &&
                active.startTimestamp !== undefined
              ) {
                requestDuration.record(
                  readHttpRequestDurationSeconds(
                    active.startTimestamp,
                    event.timestamp,
                  ),
                  {
                    ...(event.aborted ? { 'error.type': 'abort' } : {}),
                    'http.request.method': active.method,
                    'http.response.status_code': event.statusCode,
                  },
                );
                activeRequests.add(-1, {
                  'http.request.method': active.method,
                });
              }
            },
          );

          return;
        }
        case 'http.nativeMiddleware.started': {
          openSpan(
            event.executionId,
            event.parentExecutionId,
            event.name,
            event.timestamp,
            {},
          );

          return;
        }
        case 'http.middleware.started': {
          openSpan(
            event.executionId,
            event.parentExecutionId,
            event.middleware,
            event.timestamp,
            {
              'inversify.http.middleware.phase': event.phase,
            },
          );

          return;
        }
        case 'http.guard.started': {
          openSpan(
            event.executionId,
            event.parentExecutionId,
            event.guard,
            event.timestamp,
            {},
          );

          return;
        }
        case 'http.interceptor.started': {
          openSpan(
            event.executionId,
            event.parentExecutionId,
            event.interceptor,
            event.timestamp,
            {},
          );

          return;
        }
        case 'http.pipe.started': {
          openSpan(
            event.executionId,
            event.parentExecutionId,
            event.pipe,
            event.timestamp,
            {
              'inversify.http.pipe.method': event.method,
              'inversify.http.pipe.parameter_index': event.parameterIndex,
            },
          );

          return;
        }
        case 'http.controller.started': {
          openSpan(
            event.executionId,
            event.parentExecutionId,
            `${event.controller}.${event.method}`,
            event.timestamp,
            {
              'inversify.http.controller': event.controller,
              'inversify.http.controller.method': event.method,
            },
          );

          return;
        }
        case 'http.nativeMiddleware.executed':
        case 'http.middleware.executed':
        case 'http.interceptor.executed':
        case 'http.pipe.executed':
        case 'http.controller.executed': {
          endSpan(event.executionId, event.timestamp, (span: Span): void => {
            if (event.error !== undefined) {
              recordFailure(span, event.error);
            }
          });

          return;
        }
        case 'http.guard.executed': {
          endSpan(event.executionId, event.timestamp, (span: Span): void => {
            if (event.allowed !== undefined) {
              span.setAttribute('inversify.http.guard.allowed', event.allowed);
            }

            if (event.error !== undefined) {
              recordFailure(span, event.error);
            }
          });

          return;
        }
        case 'http.error': {
          openSpan(
            event.executionId,
            event.parentExecutionId,
            event.filter ?? 'http.error',
            event.startedAt,
            event.filter === undefined
              ? {}
              : {
                  'inversify.http.error.filter': event.filter,
                },
          );
          endSpan(event.executionId, event.timestamp, (span: Span): void => {
            recordFailure(span, event.error);
          });

          return;
        }
      }
    },
  };
}
