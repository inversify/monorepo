import { HttpStatusCode } from '@inversifyjs/http-core';
import { type ExpressMiddleware } from '@inversifyjs/http-express';
import { type NextFunction, type Request, type Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulExpressMiddleware implements ExpressMiddleware {
  public async execute(
    _request: Request,
    response: Response,
    _next: NextFunction,
  ): Promise<void> {
    response.status(HttpStatusCode.FORBIDDEN).send();
  }
}
