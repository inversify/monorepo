import { ConsoleLogger, LoggerOptions, LogLevel } from '@inversifyjs/logger';

// Logger with custom options
const options: LoggerOptions = {
  json: true,
  logTypes: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO],
  timestamp: true,
};

const logger: ConsoleLogger = new ConsoleLogger('ConfiguredLogger', options);

// These will be logged (included in logTypes)
logger.error('This error will be logged');
logger.warn('This warning will be logged');
logger.info('This info will be logged');

// These will be ignored (not included in logTypes)
logger.debug('This debug message will be ignored');
logger.verbose('This verbose message will be ignored');

// Logger with different configuration
const timestampLogger: ConsoleLogger = new ConsoleLogger('TimestampLogger', {
  json: false,
  timestamp: true,
});

timestampLogger.info('This message includes a timestamp');
