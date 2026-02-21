import { ForbiddenHttpResponse } from '@inversifyjs/http-core';
import { type ExpressGuard } from '@inversifyjs/http-express-v4';
import { type Request } from 'express4';

// Begin-example
export class Express4DenyGuard implements ExpressGuard {
  public activate(_request: Request): boolean {
    throw new ForbiddenHttpResponse(
      { message: 'Missing or invalid credentials' },
      'Missing or invalid credentials',
    );
  }
}
// End-example
