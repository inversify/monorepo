import type { Logger } from '@inversifyjs/logger';
import { ConsoleLogger, LogLevel } from '@inversifyjs/logger';

// Using the Logger interface for dependency injection
class UserService {
  constructor(private readonly logger: Logger) {}

  public createUser(userData: { email: string; name: string }): void {
    this.logger.info('Creating new user', { email: userData.email });

    try {
      // Simulate user creation logic
      this.logger.debug('Validating user data', userData);

      // Using the generic log method with LogLevel enum
      this.logger.log(LogLevel.INFO, 'User created successfully', {
        context: 'UserService',
        email: userData.email,
        userId: 'generated-id',
      });
    } catch (error) {
      this.logger.error('Failed to create user', {
        email: userData.email,
        error: String(error),
      });

      throw error;
    }
  }
}

// Inject a concrete logger implementation
const logger: Logger = new ConsoleLogger('UserService');
const userService: UserService = new UserService(logger);

userService.createUser({ email: 'user@example.com', name: 'John Doe' });
