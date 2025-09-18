import { createLogger, transports } from 'winston';

import { LoggerOptions } from '../../../../model/LoggerOptions';
import { WinstonLoggerAdapter } from './WinstonLoggerAdapter';

export class StreamLogger extends WinstonLoggerAdapter {
  constructor(
    stream: NodeJS.WritableStream,
    eol?: string | undefined,
    context?: string,
    loggerOptions?: LoggerOptions,
  ) {
    const options: {
      stream: NodeJS.WritableStream;
      eol?: string;
    } = { stream };

    if (eol !== undefined) {
      options.eol = eol;
    }

    super(
      createLogger({
        transports: [new transports.Stream(options)],
      }),
      context,
      loggerOptions,
    );
  }
}
