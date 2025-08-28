import { beforeAll, describe, expect, it } from 'vitest';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { buildDefaultControllerOpenApiMetadata } from './buildDefaultControllerOpenApiMetadata';

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
