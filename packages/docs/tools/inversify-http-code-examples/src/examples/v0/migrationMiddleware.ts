import { ExpressMiddleware } from '@inversifyjs/http-express';
import { type NextFunction, type Request, type Response } from 'express';
import { inject, injectable } from 'inversify';

interface Logger {
  info(message: string): void;
}

// Begin-example
@injectable()
export class LoggerMiddleware implements ExpressMiddleware {
  constructor(@inject('Logger') private readonly logger: Logger) {}

  public execute(req: Request, _res: Response, next: NextFunction): void {
    this.logger.info(`${req.method} ${req.url}`);
    next();
  }
}
// End-example
