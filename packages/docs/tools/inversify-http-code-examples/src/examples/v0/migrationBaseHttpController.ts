import { Controller, Get } from '@inversifyjs/http-core';
import { type Request, type Response } from 'express';
import { injectable } from 'inversify';

import { httpContextStorage } from './migrationHttpContextMiddleware.js';

interface HttpContext {
  request: Request;
  response: Response;
  user?: unknown;
}

// Begin-example
@injectable()
export abstract class BaseHttpController {
  protected get httpContext(): HttpContext {
    const context: HttpContext | undefined = httpContextStorage.getStore();
    if (context === undefined) {
      throw new Error('HttpContext not available outside request scope');
    }
    return context;
  }
}

@injectable()
@Controller('/users')
export class UserController extends BaseHttpController {
  @Get('/me')
  public getCurrentUser(): unknown {
    return this.httpContext.user;
  }
}
// End-example
