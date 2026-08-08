import { beforeAll, describe, expect, it } from 'vitest';

import { bootstrap } from './configValidator.js';

describe('configValidator', () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(async () => {
      result = await bootstrap();
    });

    it('should return the validated config', () => {
      expect(result).toStrictEqual({ port: 3000 });
    });
  });
});
