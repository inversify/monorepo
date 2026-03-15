import { createLogger, transports } from 'winston';

import { type LoggerOptions } from '../../../../model/LoggerOptions.js';
import { WinstonLoggerAdapter } from './WinstonLoggerAdapter.js';

export class ConsoleLogger extends WinstonLoggerAdapter {
  constructor(context?: string, loggerOptions?: LoggerOptions) {
    super(
      createLogger({ transports: [new transports.Console()] }),
      context,
      loggerOptions,
    );
  }
}
