import { beforeAll, describe, expect, it } from 'vitest';

import { durationMs } from './durationMs.js';

describe(durationMs, () => {
  describe('having a response sent 18 milliseconds after the request started', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = durationMs(
          '2026-10-19T20:00:00.000Z',
          '2026-10-19T20:00:00.018Z',
        );
      });

      it('should return the elapsed milliseconds', () => {
        expect(result).toBe(18);
      });
    });
  });

  describe('having a timestamp that is not a date', () => {
    describe('when called', () => {
      it('should throw', () => {
        expect(() => {
          durationMs('not-a-date', '2026-10-19T20:00:00.000Z');
        }).toThrow('Execution timestamps are not valid dates.');
      });
    });
  });
});
