import { ExpressMiddleware } from '@inversifyjs/http-express';
import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export class SuccessfulExpressMiddleware implements ExpressMiddleware {
  public async execute(
    _request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    response.setHeader('x-test-header', 'test-value');

    next();
  }
}
