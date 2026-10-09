import { describe, expect, it } from 'vitest';

import { type EventSink } from '../models/EventSink.js';
import { type HttpInstrumentationEvent } from '../models/HttpInstrumentationEvent.js';
import { buildHttpInstrumentationContext } from './buildHttpInstrumentationContext.js';

describe(buildHttpInstrumentationContext, () => {
  describe('having no sinks', () => {
    describe('when called', () => {
      it('should leave instrumentation disabled', () => {
        expect(
          buildHttpInstrumentationContext(undefined, (): void => undefined),
        ).toBeUndefined();
        expect(
          buildHttpInstrumentationContext([], (): void => undefined),
        ).toBeUndefined();
      });
    });
  });

  describe('having sinks', () => {
    describe('when called', () => {
      it('should keep the sinks', () => {
        const sink: EventSink<HttpInstrumentationEvent> = {
          emit: (): void => undefined,
        };

        expect(
          buildHttpInstrumentationContext([sink], (): void => undefined),
        ).toStrictEqual({
          reportSinkError: expect.any(Function),
          sinks: [sink],
        });
      });
    });
  });
});
