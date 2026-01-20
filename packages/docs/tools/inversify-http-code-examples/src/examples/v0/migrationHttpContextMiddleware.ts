import { AsyncLocalStorage } from 'node:async_hooks';

import { ExpressMiddleware } from '@inversifyjs/http-express';
import { type NextFunction, type Request, type Response } from 'express';
import { injectable } from 'inversify';

// Begin-example
export interface HttpContext {
  request: Request;
  response: Response;
  user?: unknown;
}

export const httpContextStorage: AsyncLocalStorage<HttpContext> =
  new AsyncLocalStorage<HttpContext>();

@injectable()
export class HttpContextMiddleware implements ExpressMiddleware {
  public execute(req: Request, res: Response, next: NextFunction): void {
    httpContextStorage.run({ request: req, response: res }, () => {
      next();
    });
  }
}
// End-example
