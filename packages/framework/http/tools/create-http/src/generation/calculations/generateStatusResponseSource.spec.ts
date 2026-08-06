import { beforeAll, describe, expect, it } from 'vitest';

import { generateStatusResponseSource } from './generateStatusResponseSource.js';

describe(generateStatusResponseSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateStatusResponseSource();
    });

    it('should generate the StatusResponse interface', () => {
      expect(result).toContain('export interface StatusResponse');
      expect(result).toContain('status: string;');
    });
  });
});
