import { beforeAll, describe, expect, it } from 'vitest';

import { bootstrap } from './gettingStarted.js';

describe('gettingStarted', () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(async () => {
      result = await bootstrap();
    });

    it('should return the validated config', () => {
      expect(result).toStrictEqual({
        DATABASE_URL: 'postgres://localhost:5432/app',
        PORT: 3000,
      });
    });
  });
});
