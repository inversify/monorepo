import { HttpLogger } from '@inversifyjs/logger';

export const httpLogger: HttpLogger = new HttpLogger(
  'http://localhost:5341/api/events/raw',
  'MyAwesomeApp',
  {
    json: true,
  },
);

httpLogger.debug('This is a debug message');
httpLogger.error('This is an error message');
httpLogger.info('This is an info message');
httpLogger.warn('This is a warning message');
