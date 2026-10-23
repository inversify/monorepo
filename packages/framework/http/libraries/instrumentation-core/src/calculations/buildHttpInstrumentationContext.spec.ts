import { beforeAll, describe, expect, it } from 'vitest';

import { type EventSink } from '../models/EventSink.js';
import { type HttpInstrumentationContext } from '../models/HttpInstrumentationContext.js';
import { type HttpInstrumentationEvent } from '../models/HttpInstrumentationEvent.js';
import { buildHttpInstrumentationContext } from './buildHttpInstrumentationContext.js';

describe(buildHttpInstrumentationContext, () => {
  describe('having no sinks', () => {
    let sinks: readonly EventSink<HttpInstrumentationEvent>[] | undefined;

    beforeAll(() => {
      sinks = undefined;
    });

    describe('when called', () => {
      let result: HttpInstrumentationContext | undefined;

      beforeAll(() => {
        result = buildHttpInstrumentationContext((): void => undefined, sinks);
      });

      it('should leave instrumentation disabled', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an empty array of sinks', () => {
    let sinks: readonly EventSink<HttpInstrumentationEvent>[] | undefined;

    beforeAll(() => {
      sinks = [];
    });

    describe('when called', () => {
      let result: HttpInstrumentationContext | undefined;

      beforeAll(() => {
        result = buildHttpInstrumentationContext((): void => undefined, sinks);
      });

      it('should leave instrumentation disabled', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having sinks', () => {
    let sinkFixture: EventSink<HttpInstrumentationEvent>;

    beforeAll(() => {
      sinkFixture = {
        emit: (): void => undefined,
      };
    });

    describe('when called', () => {
      let result: HttpInstrumentationContext | undefined;

      beforeAll(() => {
        result = buildHttpInstrumentationContext(
          (): void => undefined,
          [sinkFixture],
        );
      });

      it('should keep the sinks', () => {
        expect(result).toStrictEqual({
          reportSinkError: expect.any(Function),
          sinks: [sinkFixture],
        });
      });
    });
  });
});
