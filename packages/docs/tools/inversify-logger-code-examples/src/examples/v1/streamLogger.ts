import process from 'node:process';

import { StreamLogger } from '@inversifyjs/logger';

export const streamLogger: StreamLogger = new StreamLogger(
  process.stdout,
  'MyAwesomeApp',
);

streamLogger.debug('This is a debug message');
streamLogger.error('This is an error message');
streamLogger.info('This is an info message');
streamLogger.warn('This is a warning message');
