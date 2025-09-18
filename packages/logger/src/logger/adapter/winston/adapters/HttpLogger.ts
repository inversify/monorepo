import { URL } from 'node:url';

import { createLogger, transports } from 'winston';

import { LoggerOptions } from '../../../../model/LoggerOptions';
import { WinstonLoggerAdapter } from './WinstonLoggerAdapter';

export class HttpLogger extends WinstonLoggerAdapter {
  constructor(
    url: URL | string,
    context?: string,
    loggerOptions?: LoggerOptions,
  ) {
    const parsedUrl: URL = typeof url === 'string' ? new URL(url) : url;

    super(
      createLogger({
        transports: [
          new transports.Http({
            host: parsedUrl.hostname,
            path: parsedUrl.pathname,
            port: parseInt(parsedUrl.port),
          }),
        ],
      }),
      context,
      loggerOptions,
    );
  }
}
