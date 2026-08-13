import { generateLoggerFactoryIdentifierSource } from '../calculations/generateLoggerFactoryIdentifierSource.js';

export class LoggerFactoryIdentifierSourceFixtures {
  public static get any(): string {
    return generateLoggerFactoryIdentifierSource();
  }
}
