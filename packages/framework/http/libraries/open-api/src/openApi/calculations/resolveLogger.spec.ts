import { beforeAll, describe, expect, it } from 'vitest';

import { ConsoleLogger, type Logger } from '@inversifyjs/logger';

import { resolveLogger } from './resolveLogger.js';

describe(resolveLogger, () => {
  describe('having option false', () => {
    describe('when called', () => {
      let result: Logger | undefined;

      beforeAll(() => {
        result = resolveLogger(false);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having option true', () => {
    describe('when called', () => {
      let result: Logger | undefined;

      beforeAll(() => {
        result = resolveLogger(true);
      });

      it('should return a ConsoleLogger instance', () => {
        expect(result).toBeInstanceOf(ConsoleLogger);
      });
    });
  });

  describe('having option undefined', () => {
    describe('when called', () => {
      let result: Logger | undefined;

      beforeAll(() => {
        result = resolveLogger(undefined);
      });

      it('should return a ConsoleLogger instance', () => {
        expect(result).toBeInstanceOf(ConsoleLogger);
      });
    });
  });

  describe('having a Logger instance', () => {
    describe('when called', () => {
      let loggerFixture: Logger;
      let result: Logger | undefined;

      beforeAll(() => {
        loggerFixture = new ConsoleLogger();
        result = resolveLogger(loggerFixture);
      });

      it('should return the same Logger instance', () => {
        expect(result).toBe(loggerFixture);
      });
    });
  });
});
