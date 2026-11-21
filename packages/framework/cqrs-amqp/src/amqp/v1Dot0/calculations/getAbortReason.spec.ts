import { beforeAll, describe, expect, it } from 'vitest';

import { getAbortReason } from './getAbortReason.js';

describe(getAbortReason, () => {
  describe('having a signal aborted with an Error', () => {
    let reasonFixture: Error;
    let signalFixture: AbortSignal;

    beforeAll(() => {
      reasonFixture = new Error('closed');
      signalFixture = AbortSignal.abort(reasonFixture);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getAbortReason(signalFixture);
      });

      it('should return the abort reason', () => {
        expect(result).toBe(reasonFixture);
      });
    });
  });

  describe('having a signal aborted with a non Error reason', () => {
    let signalFixture: AbortSignal;

    beforeAll(() => {
      signalFixture = AbortSignal.abort('not an error');
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getAbortReason(signalFixture);
      });

      it('should return a generic Error', () => {
        expect(result).toStrictEqual(new Error('Aborted'));
      });
    });
  });
});
