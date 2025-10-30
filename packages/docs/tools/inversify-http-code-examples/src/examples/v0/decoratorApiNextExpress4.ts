import { Controller, Get, Next, UseInterceptor } from '@inversifyjs/http-core';
import { ExpressInterceptor } from '@inversifyjs/http-express-v4';
import { type NextFunction, Request, Response } from 'express4';

export class Express4NextInterceptor implements ExpressInterceptor {
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
export class NextExpress4Controller {
  @UseInterceptor(Express4NextInterceptor)
  @Get()
  public getNext(@Next() next: NextFunction): void {
    next();
  }
}
// End-example
