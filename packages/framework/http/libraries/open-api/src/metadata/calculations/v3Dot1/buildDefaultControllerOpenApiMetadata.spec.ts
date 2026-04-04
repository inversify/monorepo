import { beforeAll, describe, expect, it } from 'vitest';

import { type ControllerOpenApiMetadata } from '../../models/v3Dot1/ControllerOpenApiMetadata.js';
import { buildDefaultControllerOpenApiMetadata } from './buildDefaultControllerOpenApiMetadata.js';

describe(buildDefaultControllerOpenApiMetadata, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDefaultControllerOpenApiMetadata();
    });

    it('should return the expected result', () => {
      const expected: ControllerOpenApiMetadata = {
        methodToOperationObjectMap: new Map(),
        references: new Set(),
        servers: undefined,
        summary: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
