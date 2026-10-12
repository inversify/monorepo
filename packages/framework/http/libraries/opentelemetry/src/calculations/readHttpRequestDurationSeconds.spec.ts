import { describe, expect, it } from 'vitest';

import { readHttpRequestDurationSeconds } from './readHttpRequestDurationSeconds.js';

describe(readHttpRequestDurationSeconds, () => {
  describe('having a start timestamp and an end timestamp', () => {
    describe('when called', () => {
      it('should return the elapsed seconds', () => {
        expect(readHttpRequestDurationSeconds(1_000, 1_500)).toBe(0.5);
      });
    });
  });
});
