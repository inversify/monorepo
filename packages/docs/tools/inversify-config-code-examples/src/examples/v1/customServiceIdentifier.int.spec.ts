import { beforeAll, describe, expect, it } from 'vitest';

import { bootstrap } from './customServiceIdentifier.js';

describe('customServiceIdentifier', () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(async () => {
      result = await bootstrap();
    });

    it('should return the config bound under the custom service identifier', () => {
      expect(result).toStrictEqual({ HOST: 'localhost' });
    });
  });
});
