import { describe, expect, it } from 'vitest';

import { buildHttpHeaderAttributes } from './buildHttpHeaderAttributes.js';

describe(buildHttpHeaderAttributes, () => {
  describe('having string and list header values', () => {
    describe('when called', () => {
      it('should prefix each header name', () => {
        expect(
          buildHttpHeaderAttributes('http.request.header', {
            authorization: '[redacted]',
            'set-cookie': ['a=1', 'b=2'],
          }),
        ).toStrictEqual({
          'http.request.header.authorization': '[redacted]',
          'http.request.header.set-cookie': ['a=1', 'b=2'],
        });
      });
    });
  });
});
