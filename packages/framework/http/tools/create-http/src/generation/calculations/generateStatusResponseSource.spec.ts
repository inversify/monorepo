import { beforeAll, describe, expect, it } from 'vitest';

import { StatusResponseSourceFixtures } from '../fixtures/StatusResponseSourceFixtures.js';
import { generateStatusResponseSource } from './generateStatusResponseSource.js';

describe(generateStatusResponseSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = StatusResponseSourceFixtures.any;
    });

    it('should generate the StatusResponse interface', () => {
      expect(result).toContain('export interface StatusResponse');
      expect(result).toContain('status: string;');
    });
  });
});
