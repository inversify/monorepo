import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { type EventSink } from '../models/EventSink.js';
import { type HttpInstrumentationEvent } from '../models/HttpInstrumentationEvent.js';
import { emitHttpInstrumentationEvent } from './emitHttpInstrumentationEvent.js';

describe(emitHttpInstrumentationEvent, () => {
  describe('having three sinks and a middle sink that throws', () => {
    let events: HttpInstrumentationEvent[];
    let reportSinkError: Mock<(error: unknown) => void>;
    let eventFixture: HttpInstrumentationEvent;

    beforeAll(() => {
      events = [];
      reportSinkError = vitest.fn<(error: unknown) => void>();
      eventFixture = {
        executionId: 'execution-1',
        headers: {},
        method: 'GET',
        requestId: 'request-1',
        timestamp: 1,
        type: 'http.request.started',
        url: '/orders',
      };

      const sinks: EventSink<HttpInstrumentationEvent>[] = [
        {
          emit: (event: HttpInstrumentationEvent): void => {
            events.push(event);
          },
        },
        {
          emit: (): void => {
            throw new Error('sink failed');
          },
        },
        {
          emit: (event: HttpInstrumentationEvent): void => {
            events.push(event);
          },
        },
      ];

      emitHttpInstrumentationEvent(sinks, eventFixture, reportSinkError);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should deliver the event to the sinks that do not throw', () => {
      expect(events).toStrictEqual([eventFixture, eventFixture]);
    });

    it('should freeze the event', () => {
      expect(Object.isFrozen(eventFixture)).toBe(true);
    });

    it('should report the sink failure', () => {
      expect(reportSinkError).toHaveBeenCalledExactlyOnceWith(
        expect.any(Error),
      );
    });
  });
});
