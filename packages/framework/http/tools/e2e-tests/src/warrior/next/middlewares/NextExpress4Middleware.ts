import { ExpressMiddleware } from '@inversifyjs/http-express-v4';
import { Request, Response } from 'express4';
import { injectable } from 'inversify';

@injectable()
export class NextExpress4Middleware implements ExpressMiddleware {
  public async execute(_request: Request, response: Response): Promise<void> {
    response.send();
  }
}
