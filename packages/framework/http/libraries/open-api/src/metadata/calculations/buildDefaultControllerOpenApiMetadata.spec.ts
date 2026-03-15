import { beforeAll, describe, expect, it } from 'vitest';

import { type ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata.js';
import { buildDefaultControllerOpenApiMetadata } from './buildDefaultControllerOpenApiMetadata.js';

describe(buildDefaultControllerOpenApiMetadata, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDefaultControllerOpenApiMetadata();
    });

    it('should return the expected result', () => {
      const expected: ControllerOpenApiMetadata = {
        methodToPathItemObjectMap: new Map(),
        references: new Set(),
        servers: undefined,
        summary: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
