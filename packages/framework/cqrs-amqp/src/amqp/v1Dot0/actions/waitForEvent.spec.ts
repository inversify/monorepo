import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { EventEmitter } from 'node:events';

import { waitForEvent } from './waitForEvent.js';

interface ContextFixture {
  readonly ready: boolean;
}

type BuildError = (eventName: string, context: ContextFixture) => Error;

type ShouldResolve = (context: ContextFixture) => boolean;

describe(waitForEvent, () => {
  describe('having an aborted signal', () => {
    let abortController: AbortController;
    let emitter: EventEmitter;
    let reasonFixture: Error;

    beforeAll(() => {
      abortController = new AbortController();
      emitter = new EventEmitter();
      reasonFixture = new Error('closed');

      abortController.abort(reasonFixture);
    });

    describe('when called', () => {
      let buildErrorMock: Mock<BuildError>;

      let result: unknown;

      beforeAll(async () => {
        buildErrorMock = vitest.fn<BuildError>();

        try {
          await waitForEvent<ContextFixture>({
            buildError: buildErrorMock,
            emitter,
            rejectOn: ['failed'],
            resolveOn: ['opened'],
            signal: abortController.signal,
          });
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should not register listeners', () => {
        expect(emitter.eventNames()).toStrictEqual([]);
      });

      it('should reject with the abort reason', () => {
        expect(result).toBe(reasonFixture);
      });
    });
  });

  describe('having a non aborted signal', () => {
    describe('when called, and a resolve event is emitted', () => {
      let emitter: EventEmitter;
      let contextFixture: ContextFixture;

      let result: unknown;

      beforeAll(async () => {
        emitter = new EventEmitter();
        contextFixture = { ready: true };

        const promise: Promise<ContextFixture> = waitForEvent<ContextFixture>({
          buildError: vitest.fn<BuildError>(),
          emitter,
          rejectOn: ['failed'],
          resolveOn: ['opened'],
          signal: new AbortController().signal,
        });

        emitter.emit('opened', contextFixture);

        result = await promise;
      });

      it('should remove its listeners', () => {
        expect(emitter.eventNames()).toStrictEqual([]);
      });

      it('should resolve with the event context', () => {
        expect(result).toBe(contextFixture);
      });
    });

    describe('when called without reject events, and a resolve event is emitted', () => {
      let emitter: EventEmitter;
      let contextFixture: ContextFixture;

      let result: unknown;

      beforeAll(async () => {
        emitter = new EventEmitter();
        contextFixture = { ready: true };

        const promise: Promise<ContextFixture> = waitForEvent<ContextFixture>({
          emitter,
          resolveOn: ['opened', 'closed'],
          signal: new AbortController().signal,
        });

        emitter.emit('closed', contextFixture);

        result = await promise;
      });

      it('should remove its listeners', () => {
        expect(emitter.eventNames()).toStrictEqual([]);
      });

      it('should resolve with the event context', () => {
        expect(result).toBe(contextFixture);
      });
    });

    describe('when called, and a resolve event is emitted, and shouldResolve() returns false', () => {
      let emitter: EventEmitter;
      let shouldResolveMock: Mock<ShouldResolve>;
      let errorFixture: Error;
      let rejectedContextFixture: ContextFixture;
      let skippedContextFixture: ContextFixture;
      let buildErrorMock: Mock<BuildError>;

      let result: unknown;

      beforeAll(async () => {
        emitter = new EventEmitter();
        shouldResolveMock = vitest.fn<ShouldResolve>();
        errorFixture = new Error('refused');
        rejectedContextFixture = { ready: false };
        skippedContextFixture = { ready: false };
        buildErrorMock = vitest.fn<BuildError>();

        shouldResolveMock.mockReturnValueOnce(false);
        buildErrorMock.mockReturnValueOnce(errorFixture);

        const promise: Promise<ContextFixture> = waitForEvent<ContextFixture>({
          buildError: buildErrorMock,
          emitter,
          rejectOn: ['failed'],
          resolveOn: ['opened'],
          shouldResolve: shouldResolveMock,
          signal: new AbortController().signal,
        });

        emitter.emit('opened', skippedContextFixture);
        emitter.emit('failed', rejectedContextFixture);

        try {
          await promise;
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should call shouldResolve()', () => {
        expect(shouldResolveMock).toHaveBeenCalledExactlyOnceWith(
          skippedContextFixture,
        );
      });

      it('should call buildError()', () => {
        expect(buildErrorMock).toHaveBeenCalledExactlyOnceWith(
          'failed',
          rejectedContextFixture,
        );
      });

      it('should remove its listeners', () => {
        expect(emitter.eventNames()).toStrictEqual([]);
      });

      it('should reject with the built error', () => {
        expect(result).toBe(errorFixture);
      });
    });

    describe('when called, and the signal is aborted', () => {
      let emitter: EventEmitter;
      let reasonFixture: unknown;

      let result: unknown;

      beforeAll(async () => {
        const abortController: AbortController = new AbortController();

        emitter = new EventEmitter();
        reasonFixture = 'not an error';

        const promise: Promise<ContextFixture> = waitForEvent<ContextFixture>({
          buildError: vitest.fn<BuildError>(),
          emitter,
          rejectOn: ['failed'],
          resolveOn: ['opened'],
          signal: abortController.signal,
        });

        abortController.abort(reasonFixture);

        try {
          await promise;
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should remove its listeners', () => {
        expect(emitter.eventNames()).toStrictEqual([]);
      });

      it('should reject with a generic Error', () => {
        const expected: Partial<Error> = {
          message: 'Aborted',
        };

        expect(result).toBeInstanceOf(Error);
        expect(result).toStrictEqual(
          expect.objectContaining(expected) as unknown,
        );
      });
    });

    describe('when called, and the signal aborts while the listener is registered', () => {
      let emitter: EventEmitter;
      let reasonFixture: Error;
      let result: unknown;

      beforeAll(async () => {
        const abortController: AbortController = new AbortController();

        emitter = new EventEmitter();
        reasonFixture = new Error('closed');

        const originalOn: EventEmitter['on'] = emitter.on.bind(emitter);

        emitter.on = ((
          eventName: string,
          listener: (...args: unknown[]) => void,
        ): EventEmitter => {
          const registered: EventEmitter = originalOn(eventName, listener);

          abortController.abort(reasonFixture);

          return registered;
        }) as EventEmitter['on'];

        try {
          await waitForEvent<ContextFixture>({
            buildError: vitest.fn<BuildError>(),
            emitter,
            rejectOn: ['failed'],
            resolveOn: ['opened'],
            signal: abortController.signal,
          });
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should remove its listeners', () => {
        expect(emitter.eventNames()).toStrictEqual([]);
      });

      it('should reject with the abort reason', () => {
        expect(result).toBe(reasonFixture);
      });
    });

    describe('when called, and shouldResolve throws', () => {
      let emitter: EventEmitter;
      let result: unknown;

      beforeAll(async () => {
        emitter = new EventEmitter();

        const promise: Promise<ContextFixture> = waitForEvent<ContextFixture>({
          emitter,
          resolveOn: ['opened'],
          shouldResolve: (): boolean => {
            throw new Error('predicate failed');
          },
          signal: new AbortController().signal,
        });

        emitter.emit('opened', { ready: false });

        try {
          await promise;
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should remove its listeners', () => {
        expect(emitter.eventNames()).toStrictEqual([]);
      });

      it('should reject with the predicate error', () => {
        expect(result).toStrictEqual(new Error('predicate failed'));
      });
    });

    describe('when called, and buildError throws', () => {
      let emitter: EventEmitter;
      let result: unknown;

      beforeAll(async () => {
        emitter = new EventEmitter();

        const promise: Promise<ContextFixture> = waitForEvent<ContextFixture>({
          buildError: (): Error => {
            throw new Error('outcome failed');
          },
          emitter,
          rejectOn: ['failed'],
          resolveOn: ['opened'],
          signal: new AbortController().signal,
        });

        emitter.emit('failed', { ready: false });

        try {
          await promise;
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should remove its listeners', () => {
        expect(emitter.eventNames()).toStrictEqual([]);
      });

      it('should reject with the builder error', () => {
        expect(result).toStrictEqual(new Error('outcome failed'));
      });
    });
  });
});
