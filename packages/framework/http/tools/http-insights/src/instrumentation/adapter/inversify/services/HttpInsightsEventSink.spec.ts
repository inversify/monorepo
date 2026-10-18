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

import { type ExecutionManagementInputPort } from '../../../../insights/application/ports/ExecutionManagementInputPort.js';
import { type Execution } from '../../../../insights/domain/models/Execution.js';
import { HttpInsightsEventSink } from './HttpInsightsEventSink.js';

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

describe(HttpInsightsEventSink, () => {
  let executionManagementInputPortMock: Mocked<ExecutionManagementInputPort>;

  beforeAll(() => {
    executionManagementInputPortMock = {
      create: vitest.fn(),
      update: vitest.fn(),
    } as Partial<
      Mocked<ExecutionManagementInputPort>
    > as Mocked<ExecutionManagementInputPort>;
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
          executionManagementInputPortMock,
        );
      });

      describe('when called', () => {
        beforeAll(async () => {
          const otherRequestStarted: HttpInstrumentationEvent = {
            executionId: 'other-execution-id',
            headers: {},
            method: 'POST',
            requestId: 'other-request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/other',
          };
          const requestStarted: HttpInstrumentationEvent = {
            executionId: 'execution-id',
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
            executionId: 'native-execution-id',
            name: 'jsonParser',
            parentExecutionId: 'execution-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.nativeMiddleware.started',
          };
          const guardDenied: HttpInstrumentationEvent = {
            allowed: false,
            duration: 1000,
            executionId: 'guard-execution-id',
            guard: 'FooGuard',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.guard.executed',
          };
          const guardFailed: HttpInstrumentationEvent = {
            duration: 1000,
            error: { message: 'denied' },
            executionId: 'guard-error-execution-id',
            guard: 'BarGuard',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.guard.executed',
          };
          const interceptorExecuted: HttpInstrumentationEvent = {
            duration: 1000,
            executionId: 'interceptor-execution-id',
            interceptor: 'FooInterceptor',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.interceptor.executed',
          };
          const middlewareExecuted: HttpInstrumentationEvent = {
            duration: 1000,
            executionId: 'middleware-execution-id',
            middleware: 'FooMiddleware',
            parentExecutionId: 'native-execution-id',
            phase: MiddlewarePhase.PreHandler,
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.middleware.executed',
          };
          const pipeExecuted: HttpInstrumentationEvent = {
            duration: 1000,
            executionId: 'pipe-execution-id',
            method: 'getFoo',
            parameterIndex: 0,
            parentExecutionId: 'native-execution-id',
            pipe: 'StandardSchemaValidationPipe',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.pipe.executed',
          };
          const httpError: HttpInstrumentationEvent = {
            duration: 1000,
            error: { message: 'boom' },
            executionId: 'error-execution-id',
            filter: 'InversifyValidationErrorFilter',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          };
          const httpErrorWithoutFilter: HttpInstrumentationEvent = {
            duration: 1000,
            error: { message: 'unfiltered' },
            executionId: 'unfiltered-error-execution-id',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          };
          const controllerExecuted: HttpInstrumentationEvent = {
            controller: 'FooController',
            duration: 1000,
            error: { message: 'boom' },
            executionId: 'controller-execution-id',
            method: 'getFoo',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.controller.executed',
          };
          const responseSent: HttpInstrumentationEvent = {
            aborted: false,
            duration: 1000,
            executionId: 'execution-id',
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
            executionId: 'native-execution-id',
            name: 'jsonParser',
            parentExecutionId: 'execution-id',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.nativeMiddleware.executed',
          };

          executionManagementInputPortMock.create.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit(otherRequestStarted);
          await httpInsightsEventSink.emit(requestStarted);
          await httpInsightsEventSink.emit(nativeMiddlewareStarted);
          await httpInsightsEventSink.emit({
            executionId: 'guard-execution-id',
            guard: 'FooGuard',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.guard.started',
          });
          await httpInsightsEventSink.emit(guardDenied);
          await httpInsightsEventSink.emit({
            executionId: 'guard-error-execution-id',
            guard: 'BarGuard',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.guard.started',
          });
          await httpInsightsEventSink.emit(guardFailed);
          await httpInsightsEventSink.emit({
            executionId: 'interceptor-execution-id',
            interceptor: 'FooInterceptor',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.interceptor.started',
          });
          await httpInsightsEventSink.emit(interceptorExecuted);
          await httpInsightsEventSink.emit({
            executionId: 'middleware-execution-id',
            middleware: 'FooMiddleware',
            parentExecutionId: 'native-execution-id',
            phase: MiddlewarePhase.PreHandler,
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.middleware.started',
          });
          await httpInsightsEventSink.emit(middlewareExecuted);
          await httpInsightsEventSink.emit({
            executionId: 'pipe-execution-id',
            method: 'getFoo',
            parameterIndex: 0,
            parentExecutionId: 'native-execution-id',
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
            executionId: 'controller-execution-id',
            method: 'getFoo',
            parentExecutionId: 'native-execution-id',
            requestId: 'request-id',
            timestamp: startedAtFixture,
            type: 'http.controller.started',
          });
          await httpInsightsEventSink.emit(controllerExecuted);
          await httpInsightsEventSink.emit(responseSent);

          recordedBeforeNativeMiddlewareFinished =
            executionManagementInputPortMock.create.mock.calls.length > 0;

          await httpInsightsEventSink.emit(nativeMiddlewareExecuted);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should wait until the native middleware has executed', () => {
          expect(recordedBeforeNativeMiddlewareFinished).toBe(false);
        });

        it('should call executionManagementInputPort.create()', () => {
          const expected: Execution = {
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
            id: 'execution-id',
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
            executionManagementInputPortMock.create,
          ).toHaveBeenCalledExactlyOnceWith(expected);
        });
      });
    });

    describe('having an http.error before the execution is written', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` =>
              '11111111-1111-4111-8111-111111111111',
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          executionManagementInputPortMock,
        );
      });

      describe('when called', () => {
        beforeAll(async () => {
          executionManagementInputPortMock.create.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit({
            executionId: 'execution-id',
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
            executionId: 'error-execution-id',
            filter: 'LateFilter',
            requestId: 'request-id',
            startedAt: startedAtFixture,
            timestamp: timestampFixture,
            type: 'http.error',
          });
          await httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'execution-id',
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

        it('should include the error in the created execution', () => {
          expect(
            executionManagementInputPortMock.create,
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

        it('should not update the execution', () => {
          expect(
            executionManagementInputPortMock.update,
          ).not.toHaveBeenCalled();
        });
      });
    });

    describe('having an http.error while the execution is being written', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` =>
              '11111111-1111-4111-8111-111111111111',
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          executionManagementInputPortMock,
        );
      });

      describe('when called', () => {
        beforeAll(async () => {
          let resolveCreate: (() => void) | undefined;

          executionManagementInputPortMock.create.mockReturnValueOnce(
            new Promise<void>((resolve: () => void): void => {
              resolveCreate = resolve;
            }),
          );
          executionManagementInputPortMock.update.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit({
            executionId: 'execution-id',
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
            executionId: 'execution-id',
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
            executionId: 'error-execution-id',
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

        it('should create the execution without the late error', () => {
          expect(
            executionManagementInputPortMock.create,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              httpErrors: [],
            }),
          );
        });

        it('should update the execution with the late error', () => {
          expect(
            executionManagementInputPortMock.update,
          ).toHaveBeenCalledExactlyOnceWith({
            filter: {
              id: 'execution-id',
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

    describe('having an http.error after the execution is written', () => {
      let httpInsightsEventSink: HttpInsightsEventSink;

      beforeAll(() => {
        vitest
          .mocked(randomUUID)
          .mockImplementation(
            (): `${string}-${string}-${string}-${string}-${string}` =>
              '11111111-1111-4111-8111-111111111111',
          );

        httpInsightsEventSink = new HttpInsightsEventSink(
          executionManagementInputPortMock,
        );
      });

      describe('when called', () => {
        beforeAll(async () => {
          executionManagementInputPortMock.create.mockResolvedValue(undefined);
          executionManagementInputPortMock.update.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit({
            executionId: 'execution-id',
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
            executionId: 'execution-id',
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
            executionId: 'error-execution-id',
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

        it('should update the written execution', () => {
          expect(
            executionManagementInputPortMock.update,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              filter: expect.objectContaining({
                id: 'execution-id',
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
          executionManagementInputPortMock,
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          try {
            await httpInsightsEventSink.emit({
              aborted: true,
              duration: 1,
              executionId: 'execution-id',
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
              'Cannot persist execution "execution-id" without an http.request.started event.',
            ),
          );
        });

        it('should not call executionManagementInputPort.create()', () => {
          expect(
            executionManagementInputPortMock.create,
          ).not.toHaveBeenCalled();
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
          executionManagementInputPortMock,
        );
      });

      describe('when called, and the write then succeeds', () => {
        let result: unknown;

        beforeAll(async () => {
          const requestStarted: HttpInstrumentationEvent = {
            executionId: 'execution-id',
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
            executionId: 'execution-id',
            headers: {},
            requestId: 'request-id',
            startedAt: startedAtFixture,
            statusCode: 204,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          };

          executionManagementInputPortMock.create.mockRejectedValueOnce(
            new Error('db'),
          );
          executionManagementInputPortMock.create.mockResolvedValueOnce(
            undefined,
          );

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

        it('should call executionManagementInputPort.create() again', () => {
          expect(executionManagementInputPortMock.create).toHaveBeenCalledTimes(
            2,
          );
        });

        it('should not update the execution', () => {
          expect(
            executionManagementInputPortMock.update,
          ).not.toHaveBeenCalled();
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
          executionManagementInputPortMock,
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(async () => {
          let rejectCreate: ((error: unknown) => void) | undefined;

          executionManagementInputPortMock.create.mockReturnValueOnce(
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
            executionId: 'execution-id',
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
            executionId: 'execution-id',
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
            executionId: 'error-execution-id',
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

        it('should not update the execution', () => {
          expect(
            executionManagementInputPortMock.update,
          ).not.toHaveBeenCalled();
        });
      });
    });
  });
});
