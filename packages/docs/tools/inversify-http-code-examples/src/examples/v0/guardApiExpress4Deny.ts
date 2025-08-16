import { ForbiddenHttpResponse, Guard } from '@inversifyjs/http-core';
import { Request } from 'express4';

// Begin-example
export class Express4DenyGuard implements Guard<Request> {
  public activate(_request: Request): boolean {
    throw new ForbiddenHttpResponse('Missing or invalid credentials');
  }
}
// End-example
