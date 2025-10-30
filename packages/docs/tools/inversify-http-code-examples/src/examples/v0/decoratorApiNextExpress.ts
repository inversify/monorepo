import { Controller, Get, Next, UseInterceptor } from '@inversifyjs/http-core';
import { ExpressInterceptor } from '@inversifyjs/http-express';
import { type NextFunction, Request, Response } from 'express';

export class ExpressNextInterceptor implements ExpressInterceptor {
  public async intercept(
    _request: Request,
    response: Response,
    next: () => Promise<unknown>,
  ): Promise<void> {
    response.setHeader('next-was-called', 'true');
    await next();
    response.send('ok');
  }
}

// Begin-example
@Controller('/next')
@UseInterceptor(ExpressNextInterceptor)
export class NextExpressController {
  @Get()
  public getNext(@Next() next: NextFunction): void {
    next();
  }
}
// End-example
