import { ExpressMiddleware } from '@inversifyjs/http-express-v4';
import { NextFunction, Request, Response } from 'express4';
import { injectable } from 'inversify';

@injectable()
export class SuccessfulExpressV4Middleware implements ExpressMiddleware {
  public async execute(
    _request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    response.setHeader('x-test-header', 'test-value');

    next();
  }
}
