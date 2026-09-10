import { beforeAll, describe, expect, it } from 'vitest';

import { StatusControllerSourceFixtures } from '../fixtures/StatusControllerSourceFixtures.js';
import { generateStatusControllerSource } from './generateStatusControllerSource.js';

describe(generateStatusControllerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = StatusControllerSourceFixtures.any;
    });

    it('should generate a StatusController with OpenAPI metadata and a GET v1 status endpoint', () => {
      expect(result).toContain(
        "import { Controller, Get, HttpStatusCode } from '@inversifyjs/http-core';",
      );
      expect(result).toContain("from '@inversifyjs/http-open-api/v3Dot2'");
      expect(result).toContain("import { inject } from 'inversify';");
      expect(result).toContain(
        "import { type Status } from '../../domain/models/Status.js';",
      );
      expect(result).toContain(
        "import { StatusV1FromStatusBuilder } from '../builders/StatusV1FromStatusBuilder.js';",
      );
      expect(result).toContain(
        "import { StatusV1 } from '../models/StatusV1.js';",
      );
      expect(result).toContain("@Controller('/v1/status')");
      expect(result).not.toContain("@Controller('/status')");
      expect(result).toContain('export class StatusController');
      expect(result).toContain('@inject(StatusV1FromStatusBuilder)');
      expect(result).toContain("@OasOperationId('getStatus')");
      expect(result).toContain("@OasTag('Status')");
      expect(result).toContain('@Get()');
      expect(result).not.toContain("@OasTag('Status')\nexport class");
      expect(result).toContain('toSchema(StatusV1)');
      expect(result).toContain('Promise<StatusV1>');
      expect(result).toContain("status: 'ok'");
      expect(result).toContain(
        'return this.#statusV1FromStatusBuilder.build(status);',
      );
    });
  });

  describe('when called with a schema-first model', () => {
    let result: string;

    beforeAll(() => {
      result = StatusControllerSourceFixtures.withApiStyleSchemaFirst;
    });

    it('should import generated types and reference component schemas', () => {
      expect(result).toContain(
        "import type { StatusV1 } from '../../../generated/api/index.js';",
      );
      expect(result).not.toContain("from '../models/StatusV1.js'");
      expect(result).not.toContain('ToSchemaFunction');
      expect(result).not.toContain('toSchema(StatusV1)');
      expect(result).toContain("$ref: '#/components/schemas/StatusV1'");
    });
  });
});
