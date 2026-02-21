import { ExpressMiddleware } from '@inversifyjs/http-express';
import { type NextFunction, type Request, type Response } from 'express';
import { inject, injectable } from 'inversify';

import { httpContextStorage } from './migrationHttpContextMiddleware.js';

interface HttpContext {
  request: Request;
  response: Response;
  user?: unknown;
}

interface AuthService {
  getUser(token: string): Promise<unknown>;
}

// Begin-example
@injectable()
export class AuthMiddleware implements ExpressMiddleware {
  constructor(
    @inject('AuthService') private readonly authService: AuthService,
  ) {}

  public async execute(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const context: HttpContext | undefined = httpContextStorage.getStore();
    if (context !== undefined) {
      const token: string | undefined = req.headers['x-auth-token'] as
        | string
        | undefined;
      if (token !== undefined) {
        context.user = await this.authService.getUser(token);
      }
    }
    next();
  }
}
// End-example
