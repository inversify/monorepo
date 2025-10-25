import { ExpressMiddleware } from '@inversifyjs/http-express';
import { type NextFunction, Request, Response } from 'express';

// Begin-example
export class ExpressCustomHeaderMiddleware implements ExpressMiddleware {
  public execute(
    _request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    response.setHeader('custom-header', 'value');
    next();
  }
}
// End-example
