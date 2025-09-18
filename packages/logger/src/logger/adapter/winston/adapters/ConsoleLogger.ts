import { createLogger, transports } from 'winston';

import { LoggerOptions } from '../../../../model/LoggerOptions';
import { WinstonLoggerAdapter } from './WinstonLoggerAdapter';

export class ConsoleLogger extends WinstonLoggerAdapter {
  constructor(context?: string, loggerOptions?: LoggerOptions) {
    super(
      createLogger({ transports: [new transports.Console()] }),
      context,
      loggerOptions,
    );
  }
}
