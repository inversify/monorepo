import { describe, expect, it } from 'vitest';

import { redactHttpHeaders } from './redactHttpHeaders.js';

describe(redactHttpHeaders, () => {
  describe('having credential headers', () => {
    describe('when called', () => {
      it('should redact credential headers and keep the others', () => {
        const headers: Readonly<Record<string, string | readonly string[]>> =
          redactHttpHeaders({
            authorization: 'secret',
            'content-length': 12,
            cookie: 'session=1',
            'proxy-authorization': 'basic secret',
            'set-cookie': ['a=1', 'b=2'],
            'x-api-key': 'key-1',
            'x-auth-token': 'token-1',
            'x-empty': undefined,
            'x-request-id': 'req-1',
          });

        expect(Object.isFrozen(headers)).toBe(true);
        expect(headers).toStrictEqual({
          authorization: '[redacted]',
          'content-length': '12',
          cookie: '[redacted]',
          'proxy-authorization': '[redacted]',
          'set-cookie': '[redacted]',
          'x-api-key': '[redacted]',
          'x-auth-token': '[redacted]',
          'x-request-id': 'req-1',
        });
      });
    });
  });
});
