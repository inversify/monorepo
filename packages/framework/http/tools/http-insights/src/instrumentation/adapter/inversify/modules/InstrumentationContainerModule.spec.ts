import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { Container } from 'inversify';

import { type ExecuteUpdateCommand } from '../../../../insights/application/models/ExecuteUpdateCommand.js';
import { CallManagementInputPort } from '../../../../insights/application/ports/CallManagementInputPort.js';
import { ErrorTracesService } from '../../../../insights/application/services/ErrorTracesService.js';
import { type Call } from '../../../../insights/domain/models/Call.js';
import { HttpInsightsEventSink } from '../services/HttpInsightsEventSink.js';
import { InstrumentationContainerModule } from './InstrumentationContainerModule.js';

const timestampFixture: number = Date.parse('2026-01-01T00:00:02.000Z');

describe(InstrumentationContainerModule, () => {
  describe('having no options', () => {
    let callManagementInputPort: Mocked<CallManagementInputPort>;
    let httpInsightsEventSink: HttpInsightsEventSink;

    beforeAll(() => {
      callManagementInputPort = {
        create: vitest.fn(),
        update: vitest.fn(),
      } as Partial<
        Mocked<CallManagementInputPort>
      > as Mocked<CallManagementInputPort>;
      const errorTracesService: Mocked<ErrorTracesService> = {
        capture: vitest.fn(async (call: Call): Promise<Call> => call),
        captureUpdate: vitest.fn(
          async (
            command: ExecuteUpdateCommand,
          ): Promise<ExecuteUpdateCommand> => command,
        ),
      } as Partial<Mocked<ErrorTracesService>> as Mocked<ErrorTracesService>;
      const container: Container = new Container();

      container
        .bind(CallManagementInputPort)
        .toConstantValue(callManagementInputPort);
      container.bind(ErrorTracesService).toConstantValue(errorTracesService);
      container.load(new InstrumentationContainerModule());

      httpInsightsEventSink = container.get(HttpInsightsEventSink);
    });

    describe('having a .inversify endpoint and another endpoint', () => {
      describe('when called', () => {
        beforeAll(async () => {
          callManagementInputPort.create.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit({
            executionId: 'inversify-call-id',
            headers: {},
            method: 'GET',
            requestId: 'inversify-request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/.inversify/v1/calls',
          });
          await httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'inversify-call-id',
            headers: {},
            requestId: 'inversify-request-id',
            startedAt: timestampFixture,
            statusCode: 200,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          });
          await httpInsightsEventSink.emit({
            executionId: 'orders-call-id',
            headers: {},
            method: 'GET',
            requestId: 'orders-request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/orders',
          });
          await httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'orders-call-id',
            headers: {},
            requestId: 'orders-request-id',
            startedAt: timestampFixture,
            statusCode: 200,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should build an event sink that persists endpoints outside .inversify', () => {
          expect(
            callManagementInputPort.create,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              request: expect.objectContaining({
                url: '/orders',
              }),
            }),
          );
        });
      });
    });
  });

  describe('having a url pattern', () => {
    let callManagementInputPort: Mocked<CallManagementInputPort>;
    let httpInsightsEventSink: HttpInsightsEventSink;

    beforeAll(() => {
      callManagementInputPort = {
        create: vitest.fn(),
        update: vitest.fn(),
      } as Partial<
        Mocked<CallManagementInputPort>
      > as Mocked<CallManagementInputPort>;
      const errorTracesService: Mocked<ErrorTracesService> = {
        capture: vitest.fn(async (call: Call): Promise<Call> => call),
        captureUpdate: vitest.fn(
          async (
            command: ExecuteUpdateCommand,
          ): Promise<ExecuteUpdateCommand> => command,
        ),
      } as Partial<Mocked<ErrorTracesService>> as Mocked<ErrorTracesService>;
      const container: Container = new Container();

      container
        .bind(CallManagementInputPort)
        .toConstantValue(callManagementInputPort);
      container.bind(ErrorTracesService).toConstantValue(errorTracesService);
      container.load(
        new InstrumentationContainerModule({
          url: {
            pattern: /^\/only-this$/u,
          },
        }),
      );

      httpInsightsEventSink = container.get(HttpInsightsEventSink);
    });

    describe('having a request outside the pattern and a request that satisfies it', () => {
      describe('when called', () => {
        beforeAll(async () => {
          callManagementInputPort.create.mockResolvedValue(undefined);

          await httpInsightsEventSink.emit({
            executionId: 'other-call-id',
            headers: {},
            method: 'GET',
            requestId: 'other-request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/orders',
          });
          await httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'other-call-id',
            headers: {},
            requestId: 'other-request-id',
            startedAt: timestampFixture,
            statusCode: 204,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          });
          await httpInsightsEventSink.emit({
            executionId: 'matching-call-id',
            headers: {},
            method: 'GET',
            requestId: 'matching-request-id',
            timestamp: timestampFixture,
            type: 'http.request.started',
            url: '/only-this',
          });
          await httpInsightsEventSink.emit({
            aborted: false,
            duration: 1,
            executionId: 'matching-call-id',
            headers: {},
            requestId: 'matching-request-id',
            startedAt: timestampFixture,
            statusCode: 204,
            timestamp: timestampFixture,
            type: 'http.response.sent',
          });
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should build an event sink that receives the url pattern', () => {
          expect(
            callManagementInputPort.create,
          ).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              request: expect.objectContaining({
                url: '/only-this',
              }),
            }),
          );
        });
      });
    });
  });
});
