import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { ExpressMiddleware } from '@inversifyjs/http-express-v4';
import { NextFunction, Request, Response } from 'express4';

export class Express4NextMiddleware implements ExpressMiddleware {
  public execute(
    _request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    response.setHeader('next-was-called', 'true');
    next();
  }
}

// Begin-example
@Controller('/next')
export class NextExpress4Controller {
  @ApplyMiddleware(Express4NextMiddleware)
  @Get()
  public async getNext(): Promise<string> {
    return 'ok';
  }
}
// End-example
