import { beforeAll, describe, expect, it } from 'vitest';

import { ConfigServiceImplementation } from './ConfigServiceImplementation.js';

describe(ConfigServiceImplementation, () => {
  describe('.get', () => {
    describe('when called', () => {
      let configFixture: { database: { host: string }; port: number };
      let configService: ConfigServiceImplementation<typeof configFixture>;
      let result: typeof configFixture;

      beforeAll(() => {
        configFixture = {
          database: {
            host: 'localhost',
          },
          port: 3000,
        };
        configService = new ConfigServiceImplementation(configFixture);

        result = configService.get();
      });

      it('should return the config', () => {
        expect(result).toBe(configFixture);
      });

      it('should return a frozen config', () => {
        expect(Object.isFrozen(result)).toBe(true);
        expect(Object.isFrozen(result.database)).toBe(true);
      });

      it('should prevent mutating the config', () => {
        expect(() => {
          result.port = 4000;
        }).toThrow(TypeError);
      });
    });
  });
});
