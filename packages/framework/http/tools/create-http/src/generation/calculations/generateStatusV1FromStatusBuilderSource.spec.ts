import { beforeAll, describe, expect, it } from 'vitest';

import { StatusV1FromStatusBuilderSourceFixtures } from '../fixtures/StatusV1FromStatusBuilderSourceFixtures.js';
import { generateStatusV1FromStatusBuilderSource } from './generateStatusV1FromStatusBuilderSource.js';

describe(generateStatusV1FromStatusBuilderSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = StatusV1FromStatusBuilderSourceFixtures.any;
    });

    it('should generate a Builder from Status to StatusV1', () => {
      expect(result).toContain("import { injectable } from 'inversify';");
      expect(result).toContain(
        "import { type Builder } from '../../../common/domain/modules/Builder.js';",
      );
      expect(result).toContain(
        "import { type Status } from '../../domain/models/Status.js';",
      );
      expect(result).toContain(
        "import { type StatusV1 } from '../models/StatusV1.js';",
      );
      expect(result).toContain(
        'export class StatusV1FromStatusBuilder implements Builder<Status, StatusV1>',
      );
      expect(result).toContain('public build(input: Status): StatusV1');
      expect(result).toContain('status: input.status');
    });
  });
});
