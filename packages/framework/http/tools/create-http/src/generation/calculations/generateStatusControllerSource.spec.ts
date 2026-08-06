import { beforeAll, describe, expect, it } from 'vitest';

import { generateStatusControllerSource } from './generateStatusControllerSource.js';

describe(generateStatusControllerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateStatusControllerSource();
    });

    it('should generate a StatusController with a GET status endpoint', () => {
      expect(result).toContain(
        "import { Controller, Get } from '@inversifyjs/http-core';",
      );
      expect(result).toContain(
        "import { type StatusResponse } from '../models/StatusResponse.js';",
      );
      expect(result).not.toContain('export interface StatusResponse');
      expect(result).toContain("@Controller('/status')");
      expect(result).toContain('export class StatusController');
      expect(result).toContain('@Get()');
      expect(result).toContain("status: 'ok'");
    });
  });
});
