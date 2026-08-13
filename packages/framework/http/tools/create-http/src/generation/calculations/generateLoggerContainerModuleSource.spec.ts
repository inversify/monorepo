import { beforeAll, describe, expect, it } from 'vitest';

import { LoggerContainerModuleSourceFixtures } from '../fixtures/LoggerContainerModuleSourceFixtures.js';
import { generateLoggerContainerModuleSource } from './generateLoggerContainerModuleSource.js';

describe(generateLoggerContainerModuleSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = LoggerContainerModuleSourceFixtures.any;
    });

    it('should generate a LoggerContainerModule that binds a ConsoleLogger factory', () => {
      expect(result).toContain("from '@inversifyjs/logger'");
      expect(result).toContain('ConsoleLogger');
      expect(result).toContain('type Logger');
      expect(result).toContain('type LoggerOptions');
      expect(result).toContain("from 'inversify'");
      expect(result).toContain('ContainerModule');
      expect(result).toContain('type ContainerModuleLoadOptions');
      expect(result).not.toContain('type Factory');
      expect(result).toContain(
        "import { loggerFactoryIdentifier } from '../models/loggerFactoryIdentifier.js';",
      );
      expect(result).toContain(
        'export class LoggerContainerModule extends ContainerModule',
      );
      expect(result).toContain('constructor(options: LoggerOptions)');
      expect(result).toContain(
        '.bind<(context: string) => Logger>(loggerFactoryIdentifier)',
      );
      expect(result).toContain('.toFactory(() => {');
      expect(result).toContain('return (context: string): Logger => {');
      expect(result).toContain('return new ConsoleLogger(context, options);');
    });
  });
});
