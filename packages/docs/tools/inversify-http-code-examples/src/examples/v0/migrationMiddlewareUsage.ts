import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { injectable } from 'inversify';

import { LoggerMiddleware } from './migrationMiddleware.js';

interface User {
  id: string;
  name: string;
}

// Begin-example
@injectable()
@Controller('/users')
export class UserController {
  @ApplyMiddleware(LoggerMiddleware)
  @Get()
  public getUsers(): User[] {
    return [];
  }
}
// End-example
