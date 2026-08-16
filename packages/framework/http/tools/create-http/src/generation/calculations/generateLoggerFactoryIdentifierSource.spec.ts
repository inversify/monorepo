import { beforeAll, describe, expect, it } from 'vitest';

import { LoggerFactoryIdentifierSourceFixtures } from '../fixtures/LoggerFactoryIdentifierSourceFixtures.js';
import { generateLoggerFactoryIdentifierSource } from './generateLoggerFactoryIdentifierSource.js';

describe(generateLoggerFactoryIdentifierSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = LoggerFactoryIdentifierSourceFixtures.any;
    });

    it('should generate a logger factory service identifier', () => {
      expect(result).toContain(
        "export const loggerFactoryIdentifier: symbol = Symbol.for('Factory<Logger>');",
      );
    });
  });
});
