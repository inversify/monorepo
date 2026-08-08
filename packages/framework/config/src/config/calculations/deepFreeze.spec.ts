import { beforeAll, describe, expect, it } from 'vitest';

import { deepFreeze } from './deepFreeze.js';

describe(deepFreeze, () => {
  describe('having a nested object', () => {
    describe('when called', () => {
      let valueFixture: { database: { host: string }; port: number };
      let result: typeof valueFixture;

      beforeAll(() => {
        valueFixture = {
          database: {
            host: 'localhost',
          },
          port: 3000,
        };

        result = deepFreeze(valueFixture);
      });

      it('should return the same object reference', () => {
        expect(result).toBe(valueFixture);
      });

      it('should freeze the root object', () => {
        expect(Object.isFrozen(result)).toBe(true);
      });

      it('should freeze nested objects', () => {
        expect(Object.isFrozen(result.database)).toBe(true);
      });

      it('should prevent mutating nested properties', () => {
        expect(() => {
          result.database.host = '127.0.0.1';
        }).toThrow(TypeError);
      });
    });
  });

  describe('having an already frozen value', () => {
    describe('when called', () => {
      let valueFixture: { port: number };
      let result: typeof valueFixture;

      beforeAll(() => {
        valueFixture = Object.freeze({ port: 3000 });
        result = deepFreeze(valueFixture);
      });

      it('should return the same object reference', () => {
        expect(result).toBe(valueFixture);
      });
    });
  });
});
