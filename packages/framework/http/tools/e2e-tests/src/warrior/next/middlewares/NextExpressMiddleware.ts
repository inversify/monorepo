import { type ExpressMiddleware } from '@inversifyjs/http-express';
import { type Request, type Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export class NextExpressMiddleware implements ExpressMiddleware {
  public async execute(_request: Request, response: Response): Promise<void> {
    response.send();
  }
}
