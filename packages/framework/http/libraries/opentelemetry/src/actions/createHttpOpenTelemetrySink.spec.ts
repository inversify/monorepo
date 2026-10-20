import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import {
  type EventSink,
  type HttpInstrumentationEvent,
} from '@inversifyjs/http-instrumentation-core';
import {
  type Context,
  type Meter,
  type Span,
  SpanKind,
  SpanStatusCode,
  trace,
  type Tracer,
} from '@opentelemetry/api';

import { createHttpOpenTelemetrySink } from './createHttpOpenTelemetrySink.js';

const TRACE_ID: string = 'a'.repeat(32);

class FakeSpan {
  public readonly end: Mock<(endTime?: number) => void> = vitest.fn();
  public readonly recordException: Mock<(error: unknown) => void> = vitest.fn();
  public readonly setAttribute: Mock<
    (key: string, value: unknown) => FakeSpan
  > = vitest.fn(() => this);
  public readonly setAttributes: Mock<(attributes: unknown) => FakeSpan> =
    vitest.fn(() => this);
  public readonly setStatus: Mock<
    (status: { code: SpanStatusCode }) => FakeSpan
  > = vitest.fn(() => this);
  readonly #spanId: string;

  constructor(spanId: string) {
    this.#spanId = spanId;
  }

  public spanContext(): {
    readonly spanId: string;
    readonly traceFlags: number;
    readonly traceId: string;
  } {
    return {
      spanId: this.#spanId,
      traceFlags: 1,
      traceId: TRACE_ID,
    };
  }
}

describe(createHttpOpenTelemetrySink, () => {
  let activeRequestsAddMock: Mock<
    (value: number, attributes?: unknown) => void
  >;
  let requestDurationRecordMock: Mock<
    (value: number, attributes?: unknown) => void
  >;
  let sink: EventSink<HttpInstrumentationEvent>;
  let spans: FakeSpan[];
  let startSpanMock: Mock<
    (name: string, options?: unknown, spanContext?: Context) => Span
  >;

  beforeAll(() => {
    spans = [];
    startSpanMock = vitest.fn(
      (_name: string, _options?: unknown, _spanContext?: Context): Span => {
        const span: FakeSpan = new FakeSpan(
          spans.length.toString().padStart(16, '0'),
        );

        spans.push(span);

        return span as unknown as Span;
      },
    );
    requestDurationRecordMock = vitest.fn();
    activeRequestsAddMock = vitest.fn();
    sink = createHttpOpenTelemetrySink({
      meter: {
        createHistogram: vitest.fn(() => ({
          record: requestDurationRecordMock,
        })),
        createUpDownCounter: vitest.fn(() => ({
          add: activeRequestsAddMock,
        })),
      } as unknown as Meter,
      tracer: {
        startSpan: startSpanMock,
      } as unknown as Tracer,
    });
  });

  describe('.emit', () => {
    describe('having a request started event and a response sent event', () => {
      describe('when called, and tracer.startSpan() returns a span', () => {
        beforeAll(async () => {
          await sink.emit({
            executionId: 'request-execution',
            headers: {
              authorization: '[redacted]',
              'x-request-id': 'req-1',
            },
            method: 'GET',
            requestId: 'request-1',
            timestamp: 1_000,
            type: 'http.request.started',
            url: '/items?q=hero',
          });
          await sink.emit({
            aborted: false,
            duration: 10,
            executionId: 'request-execution',
            headers: {
              'x-audit': '1',
            },
            requestId: 'request-1',
            startedAt: 1_000,
            statusCode: 200,
            timestamp: 1_500,
            type: 'http.response.sent',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
          spans = [];
        });

        it('should call tracer.startSpan()', () => {
          expect(startSpanMock).toHaveBeenCalledWith(
            'HTTP GET',
            expect.objectContaining({
              attributes: expect.objectContaining({
                'http.request.header.authorization': '[redacted]',
                'http.request.header.x-request-id': 'req-1',
                'http.request.method': 'GET',
                'url.path': '/items',
                'url.query': 'q=hero',
              }),
              kind: SpanKind.SERVER,
              startTime: 1_000,
            }),
            expect.anything(),
          );
        });

        it('should call span.setAttribute()', () => {
          expect(spans[0]?.setAttribute).toHaveBeenCalledWith(
            'http.response.status_code',
            200,
          );
        });

        it('should call span.setAttributes()', () => {
          expect(spans[0]?.setAttributes).toHaveBeenCalledWith({
            'http.response.header.x-audit': '1',
          });
        });

        it('should call span.end()', () => {
          expect(spans[0]?.end).toHaveBeenCalledWith(1_500);
        });

        it('should call histogram.record()', () => {
          expect(requestDurationRecordMock).toHaveBeenCalledWith(0.5, {
            'http.request.method': 'GET',
            'http.response.status_code': 200,
          });
        });

        it('should call counter.add()', () => {
          expect(activeRequestsAddMock).toHaveBeenNthCalledWith(1, 1, {
            'http.request.method': 'GET',
          });
          expect(activeRequestsAddMock).toHaveBeenNthCalledWith(2, -1, {
            'http.request.method': 'GET',
          });
        });
      });
    });

    describe('having an aborted response sent event', () => {
      describe('when called, and tracer.startSpan() returns a span', () => {
        beforeAll(async () => {
          await sink.emit({
            executionId: 'request-execution',
            headers: {},
            method: 'GET',
            requestId: 'request-1',
            timestamp: 1_000,
            type: 'http.request.started',
            url: '/items',
          });
          await sink.emit({
            aborted: true,
            duration: 10,
            executionId: 'request-execution',
            headers: {},
            requestId: 'request-1',
            startedAt: 1_000,
            statusCode: 200,
            timestamp: 1_200,
            type: 'http.response.sent',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
          spans = [];
        });

        it('should call span.setAttribute()', () => {
          expect(spans[0]?.setAttribute).toHaveBeenCalledWith(
            'error.type',
            'abort',
          );
        });

        it('should call span.setStatus()', () => {
          expect(spans[0]?.setStatus).toHaveBeenCalledWith({
            code: SpanStatusCode.ERROR,
          });
        });
      });
    });

    describe('having a controller started event parented to the request span', () => {
      describe('when called, and tracer.startSpan() returns a span', () => {
        beforeAll(async () => {
          await sink.emit({
            executionId: 'request-execution',
            headers: {},
            method: 'GET',
            requestId: 'request-1',
            timestamp: 1_000,
            type: 'http.request.started',
            url: '/items',
          });
          await sink.emit({
            controller: 'ItemsController',
            executionId: 'controller-execution',
            method: 'get',
            parentExecutionId: 'request-execution',
            requestId: 'request-1',
            timestamp: 1_100,
            type: 'http.controller.started',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
          spans = [];
        });

        it('should call tracer.startSpan() with the server span as parent', () => {
          const parentContext: Context | undefined =
            startSpanMock.mock.calls[1]?.[2];

          expect(startSpanMock).toHaveBeenNthCalledWith(
            2,
            'ItemsController.get',
            expect.objectContaining({
              attributes: {
                'inversify.http.controller': 'ItemsController',
                'inversify.http.controller.method': 'get',
              },
              startTime: 1_100,
            }),
            parentContext,
          );
          expect(trace.getSpan(parentContext as Context)).toBe(spans[0]);
        });
      });
    });

    describe('having a denied guard executed event', () => {
      describe('when called, and tracer.startSpan() returns a span', () => {
        beforeAll(async () => {
          await sink.emit({
            executionId: 'guard-execution',
            guard: 'DenyGuard',
            requestId: 'request-1',
            timestamp: 1_000,
            type: 'http.guard.started',
          });
          await sink.emit({
            allowed: false,
            duration: 5,
            executionId: 'guard-execution',
            guard: 'DenyGuard',
            requestId: 'request-1',
            startedAt: 1_000,
            timestamp: 1_005,
            type: 'http.guard.executed',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
          spans = [];
        });

        it('should call span.setAttribute()', () => {
          expect(spans[0]?.setAttribute).toHaveBeenCalledWith(
            'inversify.http.guard.allowed',
            false,
          );
        });

        it('should not call span.setStatus()', () => {
          expect(spans[0]?.setStatus).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a guard executed event with an error', () => {
      describe('when called, and tracer.startSpan() returns a span', () => {
        let guardErrorFixture: Error;

        beforeAll(async () => {
          guardErrorFixture = new Error('guard failed');
          await sink.emit({
            executionId: 'guard-execution',
            guard: 'FailingGuard',
            requestId: 'request-1',
            timestamp: 1_000,
            type: 'http.guard.started',
          });
          await sink.emit({
            duration: 5,
            error: guardErrorFixture,
            executionId: 'guard-execution',
            guard: 'FailingGuard',
            requestId: 'request-1',
            startedAt: 1_000,
            timestamp: 1_005,
            type: 'http.guard.executed',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
          spans = [];
        });

        it('should call span.recordException()', () => {
          expect(spans[0]?.recordException).toHaveBeenCalledWith(
            guardErrorFixture,
          );
        });

        it('should call span.setStatus()', () => {
          expect(spans[0]?.setStatus).toHaveBeenCalledWith({
            code: SpanStatusCode.ERROR,
          });
        });
      });
    });

    describe('having a pipe started event', () => {
      describe('when called, and tracer.startSpan() returns a span', () => {
        beforeAll(async () => {
          await sink.emit({
            executionId: 'pipe-execution',
            method: 'get',
            parameterIndex: 1,
            pipe: 'TrimPipe',
            requestId: 'request-1',
            timestamp: 1_000,
            type: 'http.pipe.started',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
          spans = [];
        });

        it('should call tracer.startSpan()', () => {
          expect(startSpanMock).toHaveBeenCalledWith(
            'TrimPipe',
            expect.objectContaining({
              attributes: {
                'inversify.http.pipe.method': 'get',
                'inversify.http.pipe.parameter_index': 1,
              },
            }),
            expect.anything(),
          );
        });
      });
    });

    describe('having an error event with a filter', () => {
      describe('when called, and tracer.startSpan() returns a span', () => {
        let failureFixture: Error;

        beforeAll(async () => {
          failureFixture = new Error('request failed');
          await sink.emit({
            duration: 4,
            error: failureFixture,
            executionId: 'error-execution',
            filter: 'StageErrorFilter',
            requestId: 'request-1',
            startedAt: 1_000,
            timestamp: 1_004,
            type: 'http.error',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
          spans = [];
        });

        it('should call tracer.startSpan()', () => {
          expect(startSpanMock).toHaveBeenCalledWith(
            'StageErrorFilter',
            expect.objectContaining({
              attributes: {
                'inversify.http.error.filter': 'StageErrorFilter',
              },
              startTime: 1_000,
            }),
            expect.anything(),
          );
        });

        it('should call span.recordException()', () => {
          expect(spans[0]?.recordException).toHaveBeenCalledWith(
            failureFixture,
          );
        });

        it('should call span.end()', () => {
          expect(spans[0]?.end).toHaveBeenCalledWith(1_004);
        });
      });
    });
  });
});
