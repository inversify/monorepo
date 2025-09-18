import { ConsoleLogger } from '@inversifyjs/logger';

const logger: ConsoleLogger = new ConsoleLogger('UserService');

// Basic logging with context
const userContext: Record<string, unknown> = {
  action: 'login',
  context: 'Authentication',
  userId: '12345',
};

logger.info('User login attempt', userContext);
logger.error('Login failed', { ...userContext, reason: 'Invalid password' });

// Using different log levels
logger.debug('Debug information', { requestId: 'req-001' });
logger.verbose('Verbose information', { module: 'UserService' });
logger.silly('Silly level logging', { details: 'Very detailed info' });
