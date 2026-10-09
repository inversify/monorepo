import { describe, expect, it } from 'vitest';

import { redactHttpHeaders } from './redactHttpHeaders.js';

describe(redactHttpHeaders, () => {
  describe('having authorization, cookie, and set-cookie headers', () => {
    describe('when called', () => {
      it('should redact credential headers and keep the others', () => {
        const headers: Readonly<Record<string, string | readonly string[]>> =
          redactHttpHeaders({
            authorization: 'secret',
            'content-length': 12,
            cookie: 'session=1',
            'set-cookie': ['a=1', 'b=2'],
            'x-empty': undefined,
            'x-request-id': 'req-1',
          });

        expect(Object.isFrozen(headers)).toBe(true);
        expect(headers).toStrictEqual({
          authorization: '[redacted]',
          'content-length': '12',
          cookie: '[redacted]',
          'set-cookie': '[redacted]',
          'x-request-id': 'req-1',
        });
      });
    });
  });
});
