import { beforeAll, describe, expect, it } from 'vitest';

import { ConfigServiceImplementation } from './ConfigServiceImplementation.js';

describe(ConfigServiceImplementation, () => {
  describe('.get', () => {
    describe('when called', () => {
      let configFixture: { port: number };
      let configService: ConfigServiceImplementation<{ port: number }>;
      let result: unknown;

      beforeAll(() => {
        configFixture = { port: 3000 };
        configService = new ConfigServiceImplementation(configFixture);

        result = configService.get();
      });

      it('should return the config', () => {
        expect(result).toBe(configFixture);
      });
    });
  });
});
