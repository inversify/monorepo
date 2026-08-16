import { generateLoggerContainerModuleSource } from '../calculations/generateLoggerContainerModuleSource.js';

export class LoggerContainerModuleSourceFixtures {
  public static get any(): string {
    return generateLoggerContainerModuleSource();
  }
}
