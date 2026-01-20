import { ExpressMiddleware } from '@inversifyjs/http-express';
import { type NextFunction, type Request, type Response } from 'express';

// Begin-example
export class TracingMiddleware implements ExpressMiddleware {
  public execute(req: Request, _res: Response, next: NextFunction): void {
    req.traceId = req.header('X-Trace-Id') ?? '';
    next();
  }
}
// End-example
