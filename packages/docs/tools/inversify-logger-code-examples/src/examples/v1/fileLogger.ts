import { FileLogger } from '@inversifyjs/logger';

const fileLogger: FileLogger = new FileLogger('./temp/app.log', 'MyAwesomeApp');

fileLogger.debug('This is a debug message');
fileLogger.error('This is an error message');
fileLogger.info('This is an info message');
fileLogger.warn('This is a warning message');
