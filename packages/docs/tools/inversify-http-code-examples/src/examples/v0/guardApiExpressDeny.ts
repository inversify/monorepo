import { ForbiddenHttpResponse } from '@inversifyjs/http-core';
import { ExpressGuard } from '@inversifyjs/http-express';
import { Request } from 'express';

// Begin-example
export class ExpressDenyGuard implements ExpressGuard {
  public activate(_request: Request): boolean {
    throw new ForbiddenHttpResponse(
      { message: 'Missing or invalid credentials' },
      'Missing or invalid credentials',
    );
  }
}
// End-example
