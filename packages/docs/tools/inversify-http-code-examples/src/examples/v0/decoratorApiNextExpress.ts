import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { ExpressMiddleware } from '@inversifyjs/http-express';
import { NextFunction, Request, Response } from 'express';

export class ExpressNextMiddleware implements ExpressMiddleware {
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
export class NextExpressController {
  @ApplyMiddleware(ExpressNextMiddleware)
  @Get()
  public async getNext(): Promise<string> {
    return 'ok';
  }
}
// End-example
