import { ConsoleLogger } from '@inversifyjs/logger';

const consoleLogger: ConsoleLogger = new ConsoleLogger('MyAwesomeApp');

consoleLogger.debug('This is a debug message');
consoleLogger.error('This is an error message');
consoleLogger.info('This is an info message');
consoleLogger.warn('This is a warning message');
