import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { randomUUID } from 'node:crypto';

import { MiddlewarePhase } from '@inversifyjs/http-core';
import { type HttpInstrumentationEvent } from '@inversifyjs/http-instrumentation-core';

import { type CallManagementInputPort } from '../../../../insights/application/ports/CallManagementInputPort.js';
import { type Call } from '../../../../insights/domain/models/Call.js';
import {
  CALL_RETENTION_MS,
  HttpInsightsEventSink,
  MAX_COMMITTED_CALLS,
  RETENTION_SWEEP_INTERVAL_MS,
} from './HttpInsightsEventSink.js';

vitest.mock(import('node:crypto'), () => ({
  randomUUID: vitest.fn(
    (): `${string}-${string}-${string}-${string}-${string}` =>
      '11111111-1111-4111-8111-111111111111',
  ),
}));

const generatedIds: readonly `${string}-${string}-${string}-${string}-${string}`[] =
  [
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    '55555555-5555-4555-8555-555555555555',
    '66666666-6666-4666-8666-666666666666',
    '77777777-7777-4777-8777-777777777777',
    '88888888-8888-4888-8888-888888888888',
    '99999999-9999-4999-8999-999999999999',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  ];

function readGeneratedId(
  index: number,
): `${string}-${string}-${string}-${string}-${string}` {
  const generatedId:
    `${string}-${string}-${string}-${string}-${string}` | undefined =
    generatedIds[index];

  if (generatedId === undefined) {
    throw new Error('Unexpected randomUUID() call.');
  }

  return generatedId;
}

const startedAtFixture: number = Date.parse('2026-01-01T00:00:01.000Z');
const timestampFixture: number = Date.parse('2026-01-01T00:00:02.000Z');

function advancePastCallRetention(): void {
  vitest.advanceTimersByTime(CALL_RETENTION_MS + RETENTION_SWEEP_INTERVAL_MS);
}

function buildLateHttpErrorEvent(requestId: string): HttpInstrumentationEvent {
  return {
    duration: 1,
    error: { message: 'late' },
    executionId: `${requestId}-error`,
    filter: 'LateFilter',
    requestId,
    startedAt: startedAtFixture,
    timestamp: timestampFixture,
    type: 'http.error',
  };
}

function buildRequestStartedEvent(
  requestId: string,
  executionId: string,
): HttpInstrumentationEvent {
  return {
    executionId,
    headers: {},
    method: 'GET',
    requestId,
    timestamp: timestampFixture,
    type: 'http.request.started',
    url: '/foo',
  };
}

function buildResponseSentEvent(
  requestId: string,
  executionId: string,
): HttpInstrumentationEvent {
  return {
    aborted: false,
    duration: 1,
    executionId,
    headers: {},
    requestId,
    startedAt: startedAtFixture,
    statusCode: 204,
    timestamp: timestampFixture,
    type: 'http.response.sent',
  };
}

async function emitCommittedCall(
  httpInsightsEventSink: HttpInsightsEventSink,
  requestId: string,
  executionId: string,
): Promise<void> {
  await httpInsightsEventSink.emit(
    buildRequestStartedEvent(requestId, executionId),
  );
  await httpInsightsEventSink.emit(
    buildResponseSentEvent(requestId, executionId),
  );
}

async function emitCommittedCalls(
  httpInsightsEventSink: HttpInsightsEventSink,
  count: number,
): Promise<void> {
  for (let index: number = 0; index < count; index += 1) {
    await emitCommittedCall(
      httpInsightsEventSink,
      `request-${index.toString()}`,
      `call-${index.toString()}`,
    );
  }
}

describe(HttpInsightsEventSink, () => {
  let callManagementInputPortMock: Mocked<CallManagementInputPort>;

  beforeAll(() => {
    callManagementInputPortMock = {
      create: vitest.fn(),
      update: vitest.fn(),
    } as Partial<
      Mocked<CallManagementInputPort>
    > as Mocked<CallManagementInputPort>;
  });

  describe('.emit', () => {
    describe('having nested stages that finish after the response', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;
      let recordedBeforeNativeMiddlewareFinished: boolean;

      beforeAll(() => {
        let generatedIdIndex: number = 0;

        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` => {
              const generatedId: `${string}-${string}-${string}-${string}-${string}` =
                readGeneratedId(generatedIdIndex);

              generatedIdIndex += 1;

              return generatedId;
            },
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      describe('when called', () => {
        beforeAll(async () => {
          const otherRequestStarted: HttpInstrumentationEvent = {
            executionId: 'other-call-id',
            headers: {},
            method: 'POST',
            requestId: 'other-request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/other',
          };
          const requestStarted: HttpInstrumentationEvent = {
            executionId: 'call-id',
            headers: {
              host: 'foo.com',
            },
            method: 'GET',
            requestId: 'request-id',
            timestamp: Date.parse('2026-01-01T00:00:00.000Z'),
            type: 'http.request.started',
            url: '/foo',
          };
          const nativeMiddlewareStarted: HttpInstrumentationEvent = {
            executionId: 'native-call-id',
            name: 'jsonParser',
            parentExecutionId: 'call-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.nativeMiddleware.started',
          };
          const guardDenied: HttpInstrumentationEvent = {
            allowed: false,
            duration: 1000,
            executionId: 'guard-call-id',
            guard: 'FooGuard',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.guard.executed',
          };
          const guardFailed: HttpInstrumentationEvent = {
            duration: 1000,
            error: { message: 'denied' },
            executionId: 'guard-error-call-id',
            guard: 'BarGuard',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.guard.executed',
          };
          const interceptorExecuted: HttpInstrumentationEvent = {
            duration: 1000,
            executionId: 'interceptor-call-id',
            interceptor: 'FooInterceptor',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.interceptor.executed',
          };
          const middlewareExecuted: HttpInstrumentationEvent = {
            duration: 1000,
            executionId: 'middleware-call-id',
            middleware: 'FooMiddleware',
            parentExecutionId: 'native-call-id',
            phase: MiddlewarePhase.PreHandler,
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.middleware.executed',
          };
          const pipeExecuted: HttpInstrumentationEvent = {
            duration: 1000,
            executionId: 'pipe-call-id',
            method: 'getFoo',
            parameterIndex: 0,
            parentExecutionId: 'native-call-id',
            pipe: 'StandardSchemaValidationPipe',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.pipe.executed',
          };
          const httpError: HttpInstrumentationEvent = {
            duration: 1000,
            error: { message: 'boom' },
            executionId: 'error-call-id',
            filter: 'InversifyValidationErrorFilter',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          };
          const httpErrorWithoutFilter: HttpInstrumentationEvent = {
            duration: 1000,
            error: { message: 'unfiltered' },
            executionId: 'unfiltered-error-call-id',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          };
          const controllerExecuted: HttpInstrumentationEvent = {
            controller: 'FooController',
            duration: 1000,
            error: { message: 'boom' },
            executionId: 'controller-call-id',
            method: 'getFoo',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.controller.executed',
          };
          const responseSent: HttpInstrumentationEvent = {
            aborted: false,
            duration: 1000,
            executionId: 'call-id',
            headers: {
              'content-type': 'application/json',
            },
            requestId: 'request-id',
            startedAt: startedAtFixture,
            statusCode: 500,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          };
          const nativeMiddlewareExecuted: HttpInstrumentationEvent = {
            duration: 1000,
            executionId: 'native-call-id',
            name: 'jsonParser',
            parentExecutionId: 'call-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.nativeMiddleware.executed',
          };

          callManagementInputPortMock.create.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit(otherRequestStarted);
          await httpInsightsEventSink.emit(requestStarted);
          await httpInsightsEventSink.emit(nativeMiddlewareStarted);
          await httpInsightsEventSink.emit({
            executionId: 'guard-call-id',
            guard: 'FooGuard',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.guard.started',
          });
          await httpInsightsEventSink.emit(guardDenied);
          await httpInsightsEventSink.emit({
            executionId: 'guard-error-call-id',
            guard: 'BarGuard',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.guard.started',
          });
          await httpInsightsEventSink.emit(guardFailed);
          await httpInsightsEventSink.emit({
            executionId: 'interceptor-call-id',
            interceptor: 'FooInterceptor',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.interceptor.started',
          });
          await httpInsightsEventSink.emit(interceptorExecuted);
          await httpInsightsEventSink.emit({
            executionId: 'middleware-call-id',
            middleware: 'FooMiddleware',
            parentExecutionId: 'native-call-id',
            phase: MiddlewarePhase.PreHandler,
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.middleware.started',
          });
          await httpInsightsEventSink.emit(middlewareExecuted);
          await httpInsightsEventSink.emit({
            executionId: 'pipe-call-id',
            method: 'getFoo',
            parameterIndex: 0,
            parentExecutionId: 'native-call-id',
            pipe: 'StandardSchemaValidationPipe',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.pipe.started',
          });
          await httpInsightsEventSink.emit(pipeExecuted);
          await httpInsightsEventSink.emit(httpError);
          await httpInsightsEventSink.emit(httpErrorWithoutFilter);
          await httpInsightsEventSink.emit({
            controller: 'FooController',
            executionId: 'controller-call-id',
            method: 'getFoo',
            parentExecutionId: 'native-call-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.controller.started',
          });
          await httpInsightsEventSink.emit(controllerExecuted);
          await httpInsightsEventSink.emit(responseSent);

          recordedBeforeNativeMiddlewareFinished =
            callManagementInputPortMock.create.mock.calls.length > 0;

          await httpInsightsEventSink.emit(nativeMiddlewareExecuted);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should wait until the native middleware has executed', () => {
          expect(recordedBeforeNativeMiddlewareFinished).toBe(false);
        });

        it('should call callManagementInputPort.create()', () => {
          const expected: Call = {
            controller: {
              controller: 'FooController',
              endedAt: new Date(timestampFixture),
              error: { message: 'boom' },
              id: readGeneratedId(7),
              method: 'getFoo',
              startedAt: new Date(startedAtFixture),
            },
            guards: [
              {
                allowed: false,
                endedAt: new Date(timestampFixture),
                error: null,
                guard: 'FooGuard',
                id: readGeneratedId(0),
                startedAt: new Date(startedAtFixture),
              },
              {
                allowed: null,
                endedAt: new Date(timestampFixture),
                error: { message: 'denied' },
                guard: 'BarGuard',
                id: readGeneratedId(1),
                startedAt: new Date(startedAtFixture),
              },
            ],
            httpErrors: [
              {
                endedAt: new Date(timestampFixture),
                error: { message: 'boom' },
                filter: 'InversifyValidationErrorFilter',
                id: readGeneratedId(5),
                startedAt: new Date(startedAtFixture),
              },
              {
                endedAt: new Date(timestampFixture),
                error: { message: 'unfiltered' },
                filter: null,
                id: readGeneratedId(6),
                startedAt: new Date(startedAtFixture),
              },
            ],
            id: 'call-id',
            interceptors: [
              {
                endedAt: new Date(timestampFixture),
                error: null,
                id: readGeneratedId(2),
                interceptor: 'FooInterceptor',
                startedAt: new Date(startedAtFixture),
              },
            ],
            middlewares: [
              {
                endedAt: new Date(timestampFixture),
                error: null,
                id: readGeneratedId(3),
                middleware: 'FooMiddleware',
                phase: MiddlewarePhase.PreHandler,
                startedAt: new Date(startedAtFixture),
              },
            ],
            nativeMiddlewares: [
              {
                endedAt: new Date(timestampFixture),
                error: null,
                id: readGeneratedId(8),
                name: 'jsonParser',
                startedAt: new Date(startedAtFixture),
              },
            ],
            pipes: [
              {
                endedAt: new Date(timestampFixture),
                error: null,
                id: readGeneratedId(4),
                method: 'getFoo',
                parameterIndex: 0,
                pipe: 'StandardSchemaValidationPipe',
                startedAt: new Date(startedAtFixture),
              },
            ],
            request: {
              headers: {
                host: 'foo.com',
              },
              id: 'request-id',
              method: 'GET',
              startedAt: new Date('2026-01-01T00:00:00.000Z'),
              url: '/foo',
            },
            response: {
              aborted: false,
              headers: {
                'content-type': 'application/json',
              },
              id: readGeneratedId(9),
              sentAt: new Date(timestampFixture),
              statusCode: 500,
            },
          };

          expect(
            callManagementInputPortMock.create,
          ).toHaveBeenCalledExactlyOnceWith(expected);
        });
      });
    });

    describe('having an http.error before the call is written', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` =>
              '11111111-1111-4111-8111-111111111111',
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      describe('when called', () => {
        beforeAll(async () => {
          callManagementInputPortMock.create.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit({
            executionId: 'call-id',
            headers: {},
            method: 'GET',
            requestId: 'request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/foo',
          });
          await httpInsightsEventSink.emit({
            duration: 1,
            error: { message: 'boom' },
            executionId: 'error-call-id',
            filter: 'LateFilter',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          });
          await httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'call-id',
            headers: {},
            requestId: 'request-id',
            startedAt: startedAtFixture,
            statusCode: 500,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should include the error in the created call', () => {
          expect(
            callManagementInputPortMock.create,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              httpErrors: [
                expect.objectContaining({
                  error: { message: 'boom' },
                  filter: 'LateFilter',
                }),
              ],
            }),
          );
        });

        it('should not update the call', () => {
          expect(callManagementInputPortMock.update).not.toHaveBeenCalled();
        });
      });
    });

    describe('having an http.error while the call is being written', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` =>
              '11111111-1111-4111-8111-111111111111',
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      describe('when called', () => {
        beforeAll(async () => {
          let resolveCreate: (() => void) | undefined;

          callManagementInputPortMock.create.mockReturnValueOnce(
            new Promise<void>((resolve: () => void): void => {
              resolveCreate = resolve;
            }),
          );
          callManagementInputPortMock.update.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit({
            executionId: 'call-id',
            headers: {},
            method: 'GET',
            requestId: 'request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/foo',
          });

          const write: Promise<void> = httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'call-id',
            headers: {},
            requestId: 'request-id',
            startedAt: startedAtFixture,
            statusCode: 500,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          });

          await httpInsightsEventSink.emit({
            duration: 1,
            error: { message: 'late' },
            executionId: 'error-call-id',
            filter: 'LateFilter',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          });

          if (resolveCreate === undefined) {
            throw new Error('Expected create() to be called.');
          }

          resolveCreate();
          await write;
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should create the call without the late error', () => {
          expect(
            callManagementInputPortMock.create,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              httpErrors: [],
            }),
          );
        });

        it('should update the call with the late error', () => {
          expect(
            callManagementInputPortMock.update,
          ).toHaveBeenCalledExactlyOnceWith({
            filter: {
              id: 'call-id',
              request: {
                method: undefined,
                urlLike: undefined,
              },
              response: {
                statusCode: undefined,
              },
              sort: undefined,
            },
            set: {
              httpErrors: [
                expect.objectContaining({
                  error: { message: 'late' },
                  filter: 'LateFilter',
                }),
              ],
            },
          });
        });
      });
    });

    describe('having an http.error after the call is written', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` =>
              '11111111-1111-4111-8111-111111111111',
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      describe('when called', () => {
        beforeAll(async () => {
          callManagementInputPortMock.create.mockResolvedValue(undefined);
          callManagementInputPortMock.update.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit({
            executionId: 'call-id',
            headers: {},
            method: 'GET',
            requestId: 'request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/foo',
          });
          await httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'call-id',
            headers: {},
            requestId: 'request-id',
            startedAt: startedAtFixture,
            statusCode: 204,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          });
          await httpInsightsEventSink.emit({
            duration: 1,
            error: { message: 'late' },
            executionId: 'error-call-id',
            filter: 'LateFilter',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should update the written call', () => {
          expect(
            callManagementInputPortMock.update,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              filter: expect.objectContaining({
                id: 'call-id',
              }),
              set: {
                httpErrors: [
                  expect.objectContaining({
                    error: { message: 'late' },
                    filter: 'LateFilter',
                  }),
                ],
              },
            }),
          );
        });
      });
    });

    describe('having an http.response.sent event without a request', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          try {
            await httpInsightsEventSink.emit({
              aborted: true,
              duration: 1,
              executionId: 'call-id',
              headers: {},
              requestId: 'request-id',
              startedAt: startedAtFixture,
              statusCode: 500,
              timestamp: timestampFixture,
              type: 'http.response.sent',
            });
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              'Cannot persist call "call-id" without an http.request.started event.',
            ),
          );
        });

        it('should not call callManagementInputPort.create()', () => {
          expect(callManagementInputPortMock.create).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a create that fails', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` =>
              '11111111-1111-4111-8111-111111111111',
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      describe('when called, and the write then succeeds', () => {
        let result: unknown;

        beforeAll(async () => {
          const requestStarted: HttpInstrumentationEvent = {
            executionId: 'call-id',
            headers: {},
            method: 'GET',
            requestId: 'request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/foo',
          };
          const responseSent: HttpInstrumentationEvent = {
            aborted: false,
            duration: 1,
            executionId: 'call-id',
            headers: {},
            requestId: 'request-id',
            startedAt: startedAtFixture,
            statusCode: 204,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          };

          callManagementInputPortMock.create.mockRejectedValueOnce(
            new Error('db'),
          );
          callManagementInputPortMock.create.mockResolvedValueOnce(undefined);

          await httpInsightsEventSink.emit(requestStarted);

          try {
            await httpInsightsEventSink.emit(responseSent);
          } catch (error: unknown) {
            result = error;
          }

          await httpInsightsEventSink.emit(responseSent);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw the write Error', () => {
          expect(result).toStrictEqual(new Error('db'));
        });

        it('should call callManagementInputPort.create() again', () => {
          expect(callManagementInputPortMock.create).toHaveBeenCalledTimes(2);
        });

        it('should not update the call', () => {
          expect(callManagementInputPortMock.update).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a create that fails while an http.error arrives', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` =>
              '11111111-1111-4111-8111-111111111111',
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          let rejectCreate: ((error: unknown) => void) | undefined;

          callManagementInputPortMock.create.mockReturnValueOnce(
            new Promise<void>(
              (
                _resolve: () => void,
                reject: (error: unknown) => void,
              ): void => {
                rejectCreate = reject;
              },
            ),
          );

          await httpInsightsEventSink.emit({
            executionId: 'call-id',
            headers: {},
            method: 'GET',
            requestId: 'request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/foo',
          });

          const write: Promise<void> = httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'call-id',
            headers: {},
            requestId: 'request-id',
            startedAt: startedAtFixture,
            statusCode: 500,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          });

          await httpInsightsEventSink.emit({
            duration: 1,
            error: { message: 'late' },
            executionId: 'error-call-id',
            filter: 'LateFilter',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          });

          if (rejectCreate === undefined) {
            throw new Error('Expected create() to be called.');
          }

          rejectCreate(new Error('db'));

          try {
            await write;
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw the write Error', () => {
          expect(result).toStrictEqual(new Error('db'));
        });

        it('should not update the call', () => {
          expect(callManagementInputPortMock.update).not.toHaveBeenCalled();
        });
      });
    });

    describe('having an http.response.sent event without a request, and a later http.error', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      describe('when called', () => {
        let lateErrorResult: unknown;
        let responseResult: unknown;

        beforeAll(async () => {
          try {
            await httpInsightsEventSink.emit(
              buildResponseSentEvent('request-id', 'call-id'),
            );
          } catch (error: unknown) {
            responseResult = error;
          }

          try {
            await httpInsightsEventSink.emit(
              buildLateHttpErrorEvent('request-id'),
            );
            lateErrorResult = undefined;
          } catch (error: unknown) {
            lateErrorResult = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(responseResult).toStrictEqual(
            new Error(
              'Cannot persist call "call-id" without an http.request.started event.',
            ),
          );
        });

        it('should ignore the later http.error', () => {
          expect(lateErrorResult).toBeUndefined();
        });

        it('should not call callManagementInputPort.create()', () => {
          expect(callManagementInputPortMock.create).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a request that is still open inside the pending maximum age', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest.useFakeTimers();

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called', () => {
        beforeAll(async () => {
          callManagementInputPortMock.create.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit(
            buildRequestStartedEvent('request-id', 'call-id'),
          );
          vitest.advanceTimersByTime(CALL_RETENTION_MS / 2);
          await httpInsightsEventSink.emit(
            buildResponseSentEvent('request-id', 'call-id'),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call callManagementInputPort.create()', () => {
          expect(
            callManagementInputPortMock.create,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              id: 'call-id',
              request: expect.objectContaining({
                id: 'request-id',
              }),
            }),
          );
        });
      });
    });

    describe('having a request that is still open when the pending entry expires', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest.useFakeTimers();

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          callManagementInputPortMock.create.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit(
            buildRequestStartedEvent('request-id', 'call-id'),
          );
          advancePastCallRetention();

          try {
            await httpInsightsEventSink.emit(
              buildResponseSentEvent('request-id', 'call-id'),
            );
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              'Cannot persist call "call-id" without an http.request.started event.',
            ),
          );
        });

        it('should not call callManagementInputPort.create()', () => {
          expect(callManagementInputPortMock.create).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a non-error event after the call is committed', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest.useFakeTimers();

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          callManagementInputPortMock.create.mockResolvedValue(undefined);

          await emitCommittedCall(
            httpInsightsEventSink,
            'request-id',
            'call-id',
          );

          try {
            await httpInsightsEventSink.emit(
              buildResponseSentEvent('request-id', 'call-id'),
            );
            result = undefined;
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not throw an Error', () => {
          expect(result).toBeUndefined();
        });

        it('should not call callManagementInputPort.create() again', () => {
          expect(callManagementInputPortMock.create).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('having an http.error before the committed call expires', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest.useFakeTimers();

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called', () => {
        beforeAll(async () => {
          callManagementInputPortMock.create.mockResolvedValue(undefined);
          callManagementInputPortMock.update.mockResolvedValue(undefined);

          await emitCommittedCall(
            httpInsightsEventSink,
            'request-id',
            'call-id',
          );
          vitest.advanceTimersByTime(CALL_RETENTION_MS / 2);
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-id'),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should update the written call', () => {
          expect(
            callManagementInputPortMock.update,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              filter: expect.objectContaining({
                id: 'call-id',
              }),
            }),
          );
        });
      });
    });

    describe('having an http.error after the committed call expires', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest.useFakeTimers();

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called', () => {
        beforeAll(async () => {
          callManagementInputPortMock.create.mockResolvedValue(undefined);
          callManagementInputPortMock.update.mockResolvedValue(undefined);

          await emitCommittedCall(
            httpInsightsEventSink,
            'request-id',
            'call-id',
          );
          advancePastCallRetention();
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-id'),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not update the call', () => {
          expect(callManagementInputPortMock.update).not.toHaveBeenCalled();
        });
      });
    });

    describe('having an http.error while the committed update is in flight at expiry', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest.useFakeTimers();

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called', () => {
        beforeAll(async () => {
          let resolveUpdate: (() => void) | undefined;

          callManagementInputPortMock.create.mockResolvedValue(undefined);
          callManagementInputPortMock.update.mockResolvedValue(undefined);
          callManagementInputPortMock.update.mockReturnValueOnce(
            new Promise<void>((resolve: () => void): void => {
              resolveUpdate = resolve;
            }),
          );

          await emitCommittedCall(
            httpInsightsEventSink,
            'request-id',
            'call-id',
          );

          const inFlightWrite: Promise<void> = httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-id'),
          );

          advancePastCallRetention();

          if (resolveUpdate === undefined) {
            throw new Error('Expected update() to be called.');
          }

          resolveUpdate();
          await inFlightWrite;
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-id'),
          );
          vitest.advanceTimersByTime(RETENTION_SWEEP_INTERVAL_MS * 2);
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-id'),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should update the call until the sweep after the in-flight write', () => {
          expect(callManagementInputPortMock.update).toHaveBeenCalledTimes(2);
          expect(callManagementInputPortMock.update).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
              filter: expect.objectContaining({
                id: 'call-id',
              }),
            }),
          );
          expect(callManagementInputPortMock.update).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
              filter: expect.objectContaining({
                id: 'call-id',
              }),
            }),
          );
        });
      });
    });

    describe('having a create that fails and the pending call is still retained', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest.useFakeTimers();

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called, and the write is retried before the pending call expires', () => {
        let result: unknown;

        beforeAll(async () => {
          callManagementInputPortMock.create.mockRejectedValueOnce(
            new Error('db'),
          );
          callManagementInputPortMock.create.mockResolvedValueOnce(undefined);

          await httpInsightsEventSink.emit(
            buildRequestStartedEvent('request-id', 'call-id'),
          );

          try {
            await httpInsightsEventSink.emit(
              buildResponseSentEvent('request-id', 'call-id'),
            );
          } catch (error: unknown) {
            result = error;
          }

          vitest.advanceTimersByTime(CALL_RETENTION_MS / 2);
          await httpInsightsEventSink.emit(
            buildResponseSentEvent('request-id', 'call-id'),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw the write Error', () => {
          expect(result).toStrictEqual(new Error('db'));
        });

        it('should call callManagementInputPort.create() again', () => {
          expect(callManagementInputPortMock.create).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe('having a create that fails and the pending call expires', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest.useFakeTimers();

        httpInsightsEventSink = new HttpInsightsEventSink(
          callManagementInputPortMock,
        );
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called', () => {
        let lateErrorResult: unknown;
        let writeResult: unknown;

        beforeAll(async () => {
          callManagementInputPortMock.create.mockRejectedValue(new Error('db'));

          await httpInsightsEventSink.emit(
            buildRequestStartedEvent('request-id', 'call-id'),
          );

          try {
            await httpInsightsEventSink.emit(
              buildResponseSentEvent('request-id', 'call-id'),
            );
          } catch (error: unknown) {
            writeResult = error;
          }

          advancePastCallRetention();

          try {
            await httpInsightsEventSink.emit(
              buildLateHttpErrorEvent('request-id'),
            );
            lateErrorResult = undefined;
          } catch (error: unknown) {
            lateErrorResult = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw the write Error', () => {
          expect(writeResult).toStrictEqual(new Error('db'));
        });

        it('should ignore a later http.error', () => {
          expect(lateErrorResult).toBeUndefined();
        });

        it('should not call callManagementInputPort.create() again', () => {
          expect(callManagementInputPortMock.create).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('having more committed calls than the retention cap', () => {
      beforeAll(() => {
        vitest.useFakeTimers();
      });

      afterAll(() => {
        vitest.clearAllTimers();
        vitest.useRealTimers();
      });

      describe('when called', () => {
        let httpInsightsEventSink: HttpInsightsEventSink;

        beforeAll(async () => {
          callManagementInputPortMock.create.mockResolvedValue(undefined);
          callManagementInputPortMock.update.mockResolvedValue(undefined);

          httpInsightsEventSink = new HttpInsightsEventSink(
            callManagementInputPortMock,
          );

          await emitCommittedCalls(
            httpInsightsEventSink,
            MAX_COMMITTED_CALLS + 1,
          );
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-0'),
          );
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-1'),
          );
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent(
              `request-${MAX_COMMITTED_CALLS.toString()}`,
            ),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should drop the oldest committed call', () => {
          expect(callManagementInputPortMock.update).toHaveBeenCalledTimes(2);
          expect(callManagementInputPortMock.update).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
              filter: expect.objectContaining({
                id: 'call-1',
              }),
            }),
          );
          expect(callManagementInputPortMock.update).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
              filter: expect.objectContaining({
                id: `call-${MAX_COMMITTED_CALLS.toString()}`,
              }),
            }),
          );
        });
      });

      describe('when called, and the oldest committed call is being updated', () => {
        let httpInsightsEventSink: HttpInsightsEventSink;

        beforeAll(async () => {
          let resolveUpdate: (() => void) | undefined;

          callManagementInputPortMock.create.mockResolvedValue(undefined);
          callManagementInputPortMock.update.mockReset();
          callManagementInputPortMock.update.mockResolvedValue(undefined);
          callManagementInputPortMock.update.mockReturnValueOnce(
            new Promise<void>((resolve: () => void): void => {
              resolveUpdate = resolve;
            }),
          );

          httpInsightsEventSink = new HttpInsightsEventSink(
            callManagementInputPortMock,
          );

          await emitCommittedCalls(httpInsightsEventSink, MAX_COMMITTED_CALLS);

          const inFlightWrite: Promise<void> = httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-0'),
          );

          await emitCommittedCall(
            httpInsightsEventSink,
            `request-${MAX_COMMITTED_CALLS.toString()}`,
            `call-${MAX_COMMITTED_CALLS.toString()}`,
          );
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-1'),
          );

          if (resolveUpdate === undefined) {
            throw new Error('Expected update() to be called.');
          }

          resolveUpdate();
          await inFlightWrite;
          await httpInsightsEventSink.emit(
            buildLateHttpErrorEvent('request-0'),
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should keep the in-flight call and drop the next one', () => {
          expect(callManagementInputPortMock.update).toHaveBeenCalledTimes(2);
          expect(callManagementInputPortMock.update).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
              filter: expect.objectContaining({
                id: 'call-0',
              }),
            }),
          );
          expect(callManagementInputPortMock.update).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
              filter: expect.objectContaining({
                id: 'call-0',
              }),
            }),
          );
        });
      });
    });
  });
});
