import { createLogger, transports } from 'winston';

import { type LoggerOptions } from '../../../../model/LoggerOptions.js';
import { WinstonLoggerAdapter } from './WinstonLoggerAdapter.js';

export class FileLogger extends WinstonLoggerAdapter {
  constructor(
    fileName: string,
    context?: string,
    loggerOptions?: LoggerOptions,
  ) {
    super(
      createLogger({
        transports: [new transports.File({ filename: fileName })],
      }),
      context,
      loggerOptions,
    );
  }
}
