import { beforeAll, describe, expect, it } from 'vitest';

import { StatusControllerSourceFixtures } from '../fixtures/StatusControllerSourceFixtures.js';
import { generateStatusControllerSource } from './generateStatusControllerSource.js';

describe(generateStatusControllerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = StatusControllerSourceFixtures.any;
    });

    it('should generate a StatusController with OpenAPI metadata and a GET status endpoint', () => {
      expect(result).toContain(
        "import { Controller, Get, HttpStatusCode } from '@inversifyjs/http-core';",
      );
      expect(result).toContain("from '@inversifyjs/http-open-api'");
      expect(result).toContain(
        "import { StatusResponse } from '../models/StatusResponse.js';",
      );
      expect(result).not.toContain('export interface StatusResponse');
      expect(result).toContain("@Controller('/status')");
      expect(result).toContain('export class StatusController');
      expect(result).toContain("@OasOperationId('getStatus')");
      expect(result).toContain("@OasTag('Status')");
      expect(result).toContain('@Get()');
      expect(result).not.toContain("@OasTag('Status')\nexport class");
      expect(result).toContain("status: 'ok'");
    });
  });
});
