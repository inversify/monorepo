import { ExpressMiddleware } from '@inversifyjs/http-express-v4';
import { type NextFunction, Request, Response } from 'express4';

// Begin-example
export class Express4CustomHeaderMiddleware implements ExpressMiddleware {
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
