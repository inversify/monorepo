import { beforeAll, describe, expect, it } from 'vitest';

import { waitUnlessAborted } from './waitUnlessAborted.js';

async function captureError(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error: unknown) {
    return error;
  }

  return undefined;
}

describe(waitUnlessAborted, () => {
  describe('having an aborted signal', () => {
    let reasonFixture: Error;
    let signalFixture: AbortSignal;

    beforeAll(() => {
      reasonFixture = new Error('closed');
      signalFixture = AbortSignal.abort(reasonFixture);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await captureError(async () =>
          waitUnlessAborted(Promise.resolve('value'), signalFixture),
        );
      });

      it('should reject with the abort reason', () => {
        expect(result).toBe(reasonFixture);
      });
    });
  });

  describe('having a non aborted signal', () => {
    describe('when called, and the promise resolves', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await waitUnlessAborted(
          Promise.resolve('value'),
          new AbortController().signal,
        );
      });

      it('should resolve with the promise value', () => {
        expect(result).toBe('value');
      });
    });

    describe('when called, and the promise rejects', () => {
      let errorFixture: Error;
      let result: unknown;

      beforeAll(async () => {
        errorFixture = new Error('failed');

        result = await captureError(async () =>
          waitUnlessAborted(
            Promise.reject(errorFixture),
            new AbortController().signal,
          ),
        );
      });

      it('should reject with the promise error', () => {
        expect(result).toBe(errorFixture);
      });
    });

    describe('when called, and the signal is aborted before the promise settles', () => {
      let reasonFixture: Error;
      let result: unknown;

      beforeAll(async () => {
        const abortController: AbortController = new AbortController();

        reasonFixture = new Error('timed out');

        const resultPromise: Promise<unknown> = captureError(async () =>
          waitUnlessAborted(
            new Promise<never>((): void => {}),
            abortController.signal,
          ),
        );

        abortController.abort(reasonFixture);

        result = await resultPromise;
      });

      it('should reject with the abort reason', () => {
        expect(result).toBe(reasonFixture);
      });
    });
  });
});
