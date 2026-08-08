import { beforeAll, describe, expect, it } from 'vitest';

import { bootstrap } from './standardSchemaValidation.js';

describe('standardSchemaValidation', () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(async () => {
      result = await bootstrap();
    });

    it('should return the coerced and validated config', () => {
      expect(result).toStrictEqual({
        NODE_ENV: 'production',
        PORT: 8080,
      });
    });
  });
});
