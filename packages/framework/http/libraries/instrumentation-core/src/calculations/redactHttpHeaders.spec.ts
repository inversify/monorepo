import { beforeAll, describe, expect, it } from 'vitest';

import { redactHttpHeaders } from './redactHttpHeaders.js';

describe(redactHttpHeaders, () => {
  describe('having credential headers', () => {
    let headersFixture: Readonly<
      Record<string, number | string | readonly string[] | undefined>
    >;

    beforeAll(() => {
      headersFixture = {
        authorization: 'secret',
        'content-length': 12,
        cookie: 'session=1',
        'proxy-authorization': 'basic secret',
        'set-cookie': ['a=1', 'b=2'],
        'x-api-key': 'key-1',
        'x-auth-token': 'token-1',
        'x-empty': undefined,
        'x-request-id': 'req-1',
      };
    });

    describe('when called', () => {
      let result: Record<string, string | readonly string[]>;

      beforeAll(() => {
        result = redactHttpHeaders(headersFixture);
      });

      it('should redact credential headers and keep the others', () => {
        expect(Object.isFrozen(result)).toBe(true);
        expect(result).toStrictEqual({
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
