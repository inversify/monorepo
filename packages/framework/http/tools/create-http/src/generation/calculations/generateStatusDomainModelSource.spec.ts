import { beforeAll, describe, expect, it } from 'vitest';

import { StatusDomainModelSourceFixtures } from '../fixtures/StatusDomainModelSourceFixtures.js';
import { generateStatusDomainModelSource } from './generateStatusDomainModelSource.js';

describe(generateStatusDomainModelSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = StatusDomainModelSourceFixtures.any;
    });

    it('should generate a Status class with a status field', () => {
      expect(result).toContain('export class Status');
      expect(result).toContain('public status!: string;');
      expect(result).not.toContain('@inversifyjs/http-open-api');
    });
  });
});
